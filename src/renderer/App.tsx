import {
    Body1Strong,
    Button,
    Card,
    CardHeader,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    Divider,
    FluentProvider,
    Input,
    Link,
    makeStyles,
    Menu,
    MenuDivider,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
    tokens,
    Toolbar,
    ToolbarButton,
    ToolbarDivider,
    webDarkTheme,
    webLightTheme,
    type Theme,
} from "@fluentui/react-components";
import { ArrowResetRegular, MoreHorizontalFilled, SaveRegular, SendRegular } from "@fluentui/react-icons";
import { ClipboardAddon } from "@xterm/addon-clipboard";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import "jetbrains-mono/css/jetbrains-mono.css";
import React, { useEffect, useRef, useState } from "react";

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
    },
    toolbar: {
        display: "flex",
        flexGrow: 1,
        flexDirection: "row-reverse",
        appRegion: "no-drag",
        margin: "0px",
        padding: "0px",
    },
    menuVersions: {
        marginLeft: tokens.spacingHorizontalSNudge,
        userSelect: "none",
        padding: tokens.spacingVerticalSNudge,
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
    sidebar: {
        height: "100%",
        width: "400px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "0px 20px 20px 40px",
        boxSizing: "border-box",
        flexShrink: 0,
    },
    image: {
        marginLeft: "15px",
        width: "32px",
        height: "32px",
        marginBottom: "-4px",
        appRegion: "no-drag",
        opacity: 0.2,
        userSelect: "none",
    },
    title: {
        appRegion: "no-drag",
        userSelect: "none",
    },
    logo: {
        height: "44px",
        marginBottom: "-12px",
        paddingTop: "8px",
    },
    card: {
        maxWidth: "100%",
        height: "fit-content",
        padding: tokens.spacingHorizontalL,
        marginBottom: tokens.spacingHorizontalMNudge,
        appRegion: "no-drag",
    },
    caption: {
        color: tokens.colorNeutralForeground3,
        textAlign: "left",
        marginBottom: tokens.spacingHorizontalM,
        appRegion: "no-drag",
    },
    commandInput: {
        flexGrow: 1,
        minWidth: "0",
        appRegion: "no-drag",
    },
    stepCard: {
        maxWidth: "100%",
        height: "fit-content",
        appRegion: "no-drag",
    },
    stepHeader: {
        appRegion: "no-drag",
        userSelect: "none",
    },
    stepCaption: {
        color: tokens.colorNeutralForeground3,
        textAlign: "left",
        appRegion: "no-drag",
        userSelect: "none",
    },
    fileContainer: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalM,
        width: "100%",
        appRegion: "no-drag",
    },
    filePath: {
        flexGrow: 1,
        minWidth: "0",
        appRegion: "no-drag",
    },
    filebutton: {
        flexShrink: 0,
        appRegion: "no-drag",
    },
});

export const App = () => {
    const [theme, setTheme] = useState<Theme>(getTheme());
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

    const getAdbVersion = async () => {
        try {
            const versionLine = await window.electron.ipcRenderer.invoke("get-source-properties");
            const adbVersion = versionLine.split("=")[1] || "Unknown";
            setAdbVersion(adbVersion);
            //console.log("ADB Version:", adbVersion);
            return adbVersion;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            //console.error("Error getting ADB version:", error);
            setAdbVersion("ADB Version: Unknown");
            return "Unknown";
        }
    };

    const getAppVersion = async () => {
        try {
            const appVersion = await window.electron.ipcRenderer.invoke("get-app-version");
            setAppVersion(appVersion);
            //console.log("App Version:", appVersion);
            return appVersion;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            //console.error("Error getting app version:", error);
            setAppVersion("App Version: Unknown");
            return "Unknown";
        }
    };

    const handleErrorOutput = (error: unknown) => {
        if (error instanceof Error) {
            // Match either the full IPC error pattern or just the ADB error pattern
            const match = error.message.match(/Error invoking remote method '[^']+': (?:Error: )?(.*)/);
            if (match) {
                try {
                    const innerError = JSON.parse(match[1]);
                    return String(innerError.stderr || innerError.message || match[1]);
                } catch {
                    // If JSON parsing fails, just return the captured error message
                    //console.log(match[1]);
                    return match[1];
                }
            }
        }
        return String(error);
    };

    const handleAdbDevicesClick = async () => {
        if (terminal) {
            terminal.write("adb devices\r\n");
            try {
                const output = await window.electron.ipcRenderer.invoke("run-adb-command", "devices");
                terminal.write("\x1b[32m");
                terminal.write(String(output.stdout || output.stderr || output));
                terminal.write("\x1b[0m");
                terminal.write("\r> ");
                //console.log(output);
            } catch (error) {
                terminal.write("\x1b[31m");
                terminal.write(`${handleErrorOutput(error)}`);
                terminal.write("\x1b[0m");
                terminal.write("\r> ");
                //console.log(error);
            }
        }
    };

    const handleRecoveryDevicesClick = async () => {
        if (terminal) {
            terminal.write("adb reboot recovery\r\n");
            try {
                const output = await window.electron.ipcRenderer.invoke("run-adb-command", "reboot recovery");
                terminal.write("\x1b[32m");
                const outputStr = output.stdout || output.stderr || "Device is rebooting to recovery mode";
                terminal.write(outputStr);
                terminal.write("\x1b[0m");
                terminal.write("\r\n\r\n> ");
                //console.log(output);
            } catch (error) {
                terminal.write("\x1b[31m");
                terminal.write(`${handleErrorOutput(error)}`);
                terminal.write("\x1b[0m");
                terminal.write("\r\n\r\n> ");
                //console.log(error);
            }
        }
    };

    const handleCustomCommandClick = async () => {
        if (terminal && customCommandInput.trim()) {
            terminal.write(customCommandInput + "\r\n");
            try {
                const actualCmd = customCommandInput.toLowerCase().startsWith("adb ")
                    ? customCommandInput.slice(4).trim()
                    : customCommandInput.trim();

                const output = await window.electron.ipcRenderer.invoke("run-adb-command", actualCmd);
                terminal.write("\x1b[32m");
                terminal.write(String(output.stdout || output.stderr || output));
                terminal.write("\x1b[0m");
                terminal.write("\r\n\r\n> ");
                //console.log(output);
            } catch (error) {
                terminal.write("\x1b[31m");
                terminal.write(`${handleErrorOutput(error)}`);
                terminal.write("\x1b[0m");
                terminal.write("\r\n\r\n> ");
                //console.log(error);
            }
            setCustomCommandInput("");
        }
    };

    const handleFileSelect = async () => {
        const { canceled, filePaths } = await window.electron.ipcRenderer.invoke("show-open-dialog");
        if (!canceled && filePaths.length > 0) {
            setFilePath(filePaths[0]);
        }
    };

    const handleSideloadClick = async () => {
        if (!filePath) {
            setDialogTitle("No File Selected");
            setDialogMessage("Please select a file to sideload first.");
            setIsDialogOpen(true);
            //console.log("No file selected");
            return;
        }
        window.electron.ipcRenderer.send("sideload-file", filePath);
        if (terminal) {
            terminal.write(`adb sideload "${filePath}"\r\n`);
        }
    };

    const commandHandler = async (cmd: string) => {
        try {
            const actualCmd = cmd.toLowerCase().startsWith("adb ") ? cmd.slice(4).trim() : cmd.trim();
            //console.log("actualCmd", actualCmd);
            const output = await window.electron.ipcRenderer.invoke("run-adb-command", actualCmd);
            return String(output.stdout || output.stderr || output);
        } catch (error) {
            //console.log("Error running command:", error);
            return handleErrorOutput(error);
        }
    };

    const handleSaveTerminalContents = async () => {
        if (!terminal) return;

        // Get terminal content and remove trailing empty lines
        const lines: string[] = [];
        for (let i = 0; i < terminal.buffer.active.length; i++) {
            const line = terminal.buffer.active.getLine(i);
            if (line) {
                lines.push(line.translateToString());
            }
        }

        // Remove trailing empty lines while preserving content
        while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
            lines.pop();
        }
        const content = lines.join("\n");

        try {
            // Show save dialog
            const result = await window.electron.ipcRenderer.invoke("show-save-dialog", {
                filters: [
                    { name: "Text Files", extensions: ["txt"] },
                    { name: "Log Files", extensions: ["log"] },
                ],
                defaultPath: `terminal_output_${new Date().toISOString().replace(/[:.]/g, "-")}.txt`,
            });

            if (!result.canceled && result.filePath) {
                // Save the file
                await window.electron.ipcRenderer.invoke("save-file", {
                    filePath: result.filePath,
                    content: content,
                });
            }
        } catch (error) {
            //console.error("Error saving terminal contents:", error);
            setDialogTitle("Save Error");
            setDialogMessage("Failed to save terminal contents: " + String(error));
            setIsDialogOpen(true);
        }
    };

    const showLicenseDialog = () => {
        setDialogTitle("Software License Details");
        setDialogMessage(
            <span>
                MinimalADB and its third-party components are licensed under the following terms:
                <ul>
                    <li>
                        MinimalADB:{" "}
                        <Link href="https://github.com/beecho01/MinimalADB/blob/main/LICENSE" target="_blank">
                            MIT License
                        </Link>
                    </li>
                    <li>
                        Android Platform Tools:{" "}
                        <Link href="https://developer.android.com/license" target="_blank">
                            Apache License 2.0
                        </Link>
                    </li>
                    <li>
                        Jetbrains Mono Font:{" "}
                        <Link href="https://www.jetbrains.com/lp/mono/#license" target="_blank">
                            SIL Open Font License 1.1
                        </Link>
                    </li>
                    <li>
                        Electron:{" "}
                        <Link href="https://github.com/electron/electron/blob/main/LICENSE" target="_blank">
                            MIT License
                        </Link>
                    </li>
                </ul>
            </span>,
        );
        setIsDialogOpen(true);
    };

    useEffect(() => {
        window.ContextBridge.onNativeThemeChanged(() => setTheme(getTheme()));

        const handleAdbError = (_event: unknown, message: unknown): void => {
            if (typeof message === "string") {
                setDialogTitle("Device Connection Error");
                setDialogMessage(message);
                setIsDialogOpen(true);
                console.log("Device Connection Error:", message);
            } else {
                console.error("Unexpected message type:", message);
            }
        };

        // Subscribe to adb-error
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

            // Handle terminal input
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
        getAdbVersion();
    }, []);

    useEffect(() => {
        getAppVersion();
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

        // Attach listeners
        window.electron.ipcRenderer.on("sideload-progress", onProgress);
        window.electron.ipcRenderer.on("sideload-complete", onComplete);
        window.electron.ipcRenderer.on("sideload-error", onError);

        return () => {
            // Safely remove listeners
            if (window.electron.ipcRenderer.removeAllListeners) {
                window.electron.ipcRenderer.removeAllListeners("sideload-progress");
                window.electron.ipcRenderer.removeAllListeners("sideload-complete");
                window.electron.ipcRenderer.removeAllListeners("sideload-error");
            } else {
                // Fallback to removeListener if available
                window.electron.ipcRenderer.removeListener?.("sideload-progress", onProgress);
                window.electron.ipcRenderer.removeListener?.("sideload-complete", onComplete);
                window.electron.ipcRenderer.removeListener?.("sideload-error", onError);
            }
        };
    }, [terminal]);

    return (
        <FluentProvider theme={theme} className={styles.fluentProvider}>
            <div className={styles.main}>
                <div className={styles.sidebar}>
                    <div>
                        {theme === webDarkTheme ? (
                            <img src="assets/MinimalADB_White_Small.png" alt="MinimalADB Logo" className={styles.logo} />
                        ) : (
                            <img src="assets/MinimalADB_Black_Small.png" alt="MinimalADB Logo" className={styles.logo} />
                        )}
                        <a href="https://github.com/beecho01/MinimalADB" target="_blank" rel="noopener noreferrer">
                            <img 
                                className={styles.image} 
                                src={theme === webDarkTheme ? "assets/github-mark-white.png" : "assets/github-mark-black.png"} 
                            />
                        </a>
                    </div>
                    <Card appearance="subtle" className={styles.stepCard}>
                        <CardHeader header={<Body1Strong className={styles.stepHeader}>Step 1</Body1Strong>} />
                        <caption className={styles.stepCaption}>Confirm your device is connected via ADB.</caption>
                        <Button onClick={handleAdbDevicesClick} appearance="primary" value="adb devices">
                            ADB devices
                        </Button>
                    </Card>
                    <Card appearance="subtle" className={styles.card}>
                        <CardHeader header={<Body1Strong className={styles.stepHeader}>Step 2</Body1Strong>} />
                        <caption className={styles.stepCaption}>Reboot into recovery mode.</caption>
                        <Button onClick={handleRecoveryDevicesClick} appearance="primary">
                            Reboot Recovery
                        </Button>
                    </Card>
                    <Card appearance="subtle" className={styles.card}>
                        <CardHeader header={<Body1Strong className={styles.stepHeader}>Step 3</Body1Strong>} />
                        <caption className={styles.stepCaption}>Pick your ROM zip file to install.</caption>
                        <div className={styles.fileContainer}>
                            <Input
                                className={styles.filePath}
                                type="text"
                                value={filePath}
                                readOnly
                                placeholder="File Path"
                                appearance="filled-darker"
                            />
                            <Button className={styles.filebutton} appearance="primary" onClick={handleFileSelect}>
                                Select
                            </Button>
                        </div>
                    </Card>
                    <Card appearance="subtle" className={styles.card}>
                        <CardHeader header={<Body1Strong className={styles.stepHeader}>Step 4</Body1Strong>} />
                        <caption className={styles.stepCaption}>Sideload the ROM file to your device.</caption>
                        <Button appearance="primary" onClick={handleSideloadClick}>
                            Flash device
                        </Button>
                    </Card>
                    <Divider />
                    <Card appearance="subtle" className={styles.card}>
                        <CardHeader header={<Body1Strong>Custom Command</Body1Strong>} />
                        <caption className={styles.caption}>Send a custom command to get more done!</caption>
                        <Input
                            className={styles.commandInput}
                            value={customCommandInput}
                            onChange={(e, data) => setCustomCommandInput(data.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleCustomCommandClick();
                                }
                            }}
                            contentAfter={
                                <Button
                                    appearance="transparent"
                                    icon={<SendRegular />}
                                    size="small"
                                    onClick={handleCustomCommandClick}
                                />
                            }
                            type="text"
                            placeholder="Input an ADB command"
                            appearance="filled-darker"
                            spellCheck={false}
                        />
                    </Card>
                </div>
                <div className={styles.workspace}>
                    <Toolbar className={styles.toolbar}>
                        <Menu>
                            <MenuTrigger>
                                <ToolbarButton aria-label="More" icon={<MoreHorizontalFilled />} onClick={() => {}} />
                            </MenuTrigger>
                            <MenuPopover>
                                <MenuList>
                                    <div className={styles.menuVersions}>MinimalADB Version: {appVersion}</div>
                                    <MenuItem disabled={true} onClick={() => {}}>
                                        Check for MinimalADB Updates
                                    </MenuItem>
                                    <MenuDivider />
                                    <div className={styles.menuVersions}>Current ADB Version: {adbVersion}</div>
                                    <MenuItem disabled={true} onClick={() => {}}>
                                        Get Latest Platform Tools
                                    </MenuItem>
                                    <MenuDivider />
                                    <MenuItem onClick={showLicenseDialog}>Software License Details</MenuItem>
                                </MenuList>
                            </MenuPopover>
                        </Menu>
                        <ToolbarDivider />
                        <ToolbarButton
                            aria-label="Save Terminal Contents"
                            icon={<SaveRegular />}
                            onClick={handleSaveTerminalContents}
                        />
                        <ToolbarButton
                            aria-label="Reset Terminal Contents"
                            icon={<ArrowResetRegular />}
                            onClick={() => {
                                terminal?.reset();
                                terminal?.write("> ");
                            }}
                        />
                    </Toolbar>
                    <div
                        className={styles.terminal}
                        style={{
                            background: theme === webDarkTheme ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.6)",
                        }}
                        ref={terminalRef}
                        spellCheck={false}
                    />
                    <Dialog open={isDialogOpen} modalType="alert">
                        <DialogSurface>
                            <DialogBody>
                                <DialogTitle>{dialogTitle}</DialogTitle>
                                <DialogContent>{dialogMessage}</DialogContent>
                                <DialogActions>
                                    <Button appearance="secondary" onClick={() => setIsDialogOpen(false)}>
                                        Close
                                    </Button>
                                </DialogActions>
                            </DialogBody>
                        </DialogSurface>
                    </Dialog>
                </div>
            </div>
        </FluentProvider>
    );
};
