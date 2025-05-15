import {
  FluentProvider,
  makeStyles,
  tokens,
  webDarkTheme,
  webLightTheme,
  type Theme,
} from "@fluentui/react-components";
import { ClipboardAddon } from "@xterm/addon-clipboard";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import "jetbrains-mono/css/jetbrains-mono.css";
import React, { useEffect, useRef, useState } from "react";
import { InfoDialog } from "./components/InfoDialog";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { ToolbarComponent } from "./components/Toolbar/Toolbar";
import { showLicenseDialog } from "./handlers/dialogHandlers";
import { handleFileSelect, handleSaveTerminalContents, handleSideloadClick } from "./handlers/fileHandlers";
import {
  commandHandler,
  handleAdbDevicesClick,
  handleCustomCommandClick,
  handleRecoveryDevicesClick,
} from "./handlers/terminalHandlers";
import { getAdbVersion, getAppVersion } from "./handlers/versionHandlers";

const shouldUseDarkColors = (): boolean =>
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

export const getTheme = () => (shouldUseDarkColors() ? webDarkTheme : webLightTheme);

const useStyles = makeStyles({
  fluentProvider: {
    height: "calc(100vh - 30.5px)",
    background: "transparent",
  },
  main: {
    height: "calc(100% - 30.5px)",
    display: "flex",
    flexDirection: "row",
    boxSizing: "border-box",
    background: "transparent",
    position: "absolute",
    top: "30.5px",
    left: "0px",
    appRegion: "drag",
  },
  workspace: {
    height: "100%",
    background: "transparent",
    display: "flex",
    flexGrow: 1,
    flexDirection: "column",
    width: "calc(100vw - 400px)",
    gap: "20px",
    padding: "25px 50px 45px 20px",
    boxSizing: "border-box",
    appRegion: "drag",
  },
  terminal: {
    display: "flex",
    flexGrow: 1,
    gap: 0,
    padding: "20px",
    margin: 0,
    overflow: "hidden",
    appRegion: "no-drag",
    borderRadius: "6px",
    border: "1px solid var(--colorNeutralStroke3)",
    height: "100%",
    width: "calc(100% - 30px)",
    fontFamily: "Jetbrains Mono",
    fontSize: "14px",
    "& .xterm-viewport": {
      background: "rgba(0, 0, 0, 0)",
      "&::-webkit-scrollbar": {
        display: "none",
      },
    },
    "& .xterm": {
      userSelect: "text",
    },
  },
});

export const App = () => {
  const [theme, setTheme] = useState<Theme>(getTheme());
  const [micaSupported, setMicaSupported] = useState(false);
  const styles = useStyles();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [dialogMessage, setDialogMessage] = useState<React.ReactNode>("");
  const [filePath, setFilePath] = React.useState("");
  const terminalRef = useRef<HTMLDivElement>(null);
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const [customCommandInput, setCustomCommandInput] = useState("");
  const [adbVersion, setAdbVersion] = useState<string>("");
  const [appVersion, setAppVersion] = useState<string>("");
  const fitAddonRef = useRef<FitAddon | null>(null);

  // Dialog helper functions
  const showDialogFn = (title: string, message: React.ReactNode) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  // Event handlers
  const handleSaveTerminalContentsFn = () => handleSaveTerminalContents(terminal, showDialogFn);
  const showLicenseDialogFn = () => showLicenseDialog(showDialogFn);

  useEffect(() => {
    window.electron.ipcRenderer
      .invoke("is-mica-supported")
      .then((res: boolean) => setMicaSupported(res))
      .catch((error) => {
        console.error("Error checking Mica support:", error);
        setMicaSupported(false);
      });
  }, []);

  useEffect(() => {
    window.ContextBridge.onNativeThemeChanged(() => setTheme(getTheme()));

    const handleAdbError = (_event: unknown, message: unknown): void => {
      if (typeof message === "string") {
        showDialogFn("Device Connection Error", message);
        console.log("Device Connection Error:", message);
      } else {
        console.error("Unexpected message type:", message);
      }
    };

    window.ContextBridge.on("adb-error", handleAdbError);

    return () => {
      window.ContextBridge.on("adb-error", () => {});
    };
  }, []);

  useEffect(() => {
    if (terminalRef.current && !terminal) {
      const term = new Terminal({
        fontFamily: "Jetbrains Mono",
        fontSize: 14,
        theme: {
          background: theme === webDarkTheme ? "rgba(0, 0, 0, 0)" : "rgba(255, 255, 255, 0)",
          foreground: theme === webDarkTheme ? "#FFFFFF" : "#000000",
        },
        cursorInactiveStyle: "bar",
        disableStdin: true,
        rows: 37,
        cols: 59,
        rightClickSelectsWord: true,
        cursorBlink: true,
      });

      const clipboardAddon = new ClipboardAddon();
      term.loadAddon(clipboardAddon);

      const fitAddon = new FitAddon();
      fitAddonRef.current = fitAddon;
      term.loadAddon(fitAddon);

      terminalRef.current.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        const selection = term.getSelection();
        if (selection) {
          navigator.clipboard.writeText(selection);
        }
      });

      term.open(terminalRef.current);
      setTerminal(term);
      term.write("> ");

      setTimeout(() => fitAddon.fit(), 100);

      term.onData((data) => {
        if (data === "\r") {
          const line = term.buffer.active.getLine(term.buffer.active.cursorY)?.translateToString();
          if (line) {
            const command = line.substring(2).trim();
            commandHandler(command).then((output) => {
              term.write("\r\n");
              if (output.toLowerCase().includes("error") || output.toLowerCase().includes("failed")) {
                term.write("\x1b[31m");
              } else {
                term.write("\x1b[32m");
              }
              term.write(output);
              term.write("\x1b[0m");
              term.write("\r\n> ");
            });
          }
        } else {
          term.write(data);
        }
      });
    }

    return () => {
      if (terminal) {
        terminal.dispose();
      }
    };
  }, [terminalRef.current]);

  useEffect(() => {
    if (terminal && fitAddonRef.current) {
      const handleResize = () => {
        fitAddonRef.current?.fit();
      };

      window.addEventListener("resize", handleResize);
      setTimeout(handleResize, 50);

      return () => window.removeEventListener("resize", handleResize);
    }
  }, [terminal]);

  useEffect(() => {
    getAdbVersion(setAdbVersion);
  }, []);

  useEffect(() => {
    getAppVersion(setAppVersion);
  }, []);

  useEffect(() => {
    const onProgress = (_event: unknown, ...args: unknown[]) => {
      const data = args[0] as { percent: number };
      const progress = data.percent;
      const filled = Math.floor(progress / 2.381);
      const empty = 42 - filled;
      const bar = "=".repeat(filled) + ">".padEnd(empty);
      terminal?.write("\x1b[32m");
      terminal?.write(`\rProgress: [${bar}] ${progress}%`);
      terminal?.write("\x1b[0m");
    };

    const onComplete = (_event: unknown, ...args: unknown[]) => {
      const data = args[0] as { code: number; success: boolean };
      if (data.success) {
        terminal?.write(`\r\x1b[32mSideload complete!)\x1b[0m\r\n\r\n> `);
      } else {
        terminal?.write(`\r\x1b[31mSideload failed (exit code ${data.code})\x1b[0m\r\n\r\n> `);
      }
    };

    const onError = (_event: unknown, ...args: unknown[]) => {
      const error = args[0] as string;
      terminal?.write(`\r\n\x1b[31mSideload error: ${error}\x1b[0m\r\n> `);
    };

    window.electron.ipcRenderer.on("sideload-progress", onProgress);
    window.electron.ipcRenderer.on("sideload-complete", onComplete);
    window.electron.ipcRenderer.on("sideload-error", onError);

    return () => {
      if (window.electron.ipcRenderer.removeAllListeners) {
        window.electron.ipcRenderer.removeAllListeners("sideload-progress");
        window.electron.ipcRenderer.removeAllListeners("sideload-complete");
        window.electron.ipcRenderer.removeAllListeners("sideload-error");
      } else {
        window.electron.ipcRenderer.removeListener?.("sideload-progress", onProgress);
        window.electron.ipcRenderer.removeListener?.("sideload-complete", onComplete);
        window.electron.ipcRenderer.removeListener?.("sideload-error", onError);
      }
    };
  }, [terminal]);

  return (
    <FluentProvider
      theme={theme}
      className={styles.fluentProvider}
      style={{
        background: micaSupported ? "transparent" : tokens.colorNeutralBackground2,
      }}
    >
      <div
        className={styles.main}
        style={{
          background: micaSupported ? "transparent" : tokens.colorNeutralBackground2,
        }}
      >
        <Sidebar
          theme={theme}
          filePath={filePath}
          customCommandInput={customCommandInput}
          onAdbDevicesClick={() => handleAdbDevicesClick(terminal)}
          onRecoveryDevicesClick={() => handleRecoveryDevicesClick(terminal)}
          onFileSelect={() => handleFileSelect(setFilePath)}
          onSideloadClick={() => handleSideloadClick(filePath, terminal, showDialogFn)}
          onCustomCommandChange={(value) => setCustomCommandInput(value)}
          onCustomCommandClick={() => handleCustomCommandClick(terminal, customCommandInput, setCustomCommandInput)}
        />
        <div
          className={styles.workspace}
          style={{
            background: micaSupported ? "transparent" : tokens.colorNeutralBackground2,
          }}
        >
          <ToolbarComponent
            terminal={terminal}
            appVersion={appVersion}
            adbVersion={adbVersion}
            onSaveTerminalContents={handleSaveTerminalContentsFn}
            showLicenseDialog={showLicenseDialogFn}
          />
          <div
            className={styles.terminal}
            style={{
              background: theme === webDarkTheme ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.6)",
            }}
            ref={terminalRef}
            spellCheck={false}
          />
          <InfoDialog isOpen={isDialogOpen} title={dialogTitle} message={dialogMessage} onClose={handleDialogClose} />
        </div>
      </div>
    </FluentProvider>
  );
};
