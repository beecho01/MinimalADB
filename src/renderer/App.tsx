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
    makeStyles,
    Title1,
    tokens,
    webDarkTheme,
    webLightTheme,
    type Theme,
} from "@fluentui/react-components";
import { SendRegular } from "@fluentui/react-icons";
import { ClipboardAddon } from "@xterm/addon-clipboard";
//import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import "jetbrains-mono/css/jetbrains-mono.css";
import React, { useEffect, useRef, useState } from "react";

const shouldUseDarkColors = (): boolean =>
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

const getTheme = () => (shouldUseDarkColors() ? webDarkTheme : webLightTheme);

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
        padding: "70px 50px 45px 20px",
        boxSizing: "border-box",
    },
    terminal: {
        display: "flex",
        flexGrow: 1,
        gap: 0,
        padding: "20px",
        margin: 0,
        overflow: "hidden",
        appRegion: "no-drag",
        background: "rgba(0, 0, 0, 0.6)",
        borderRadius: "6px",
        height: "100%",
        width: "calc(100% - 30px)",
        fontFamily: "Jetbrains Mono",
        fontSize: "14px",
        '& .xterm-viewport': {
            background: "rgba(0, 0, 0, 0)",
            '&::-webkit-scrollbar': {
                display: 'none'
            }
        },
        '& .xterm': {
            userSelect: 'text',
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
    const [dialogMessage, setDialogMessage] = useState<string>("");
    const [filePath, setFilePath] = React.useState("");
    const terminalRef = useRef<HTMLDivElement>(null);
    const [terminal, setTerminal] = useState<Terminal | null>(null);
    const [customCommandInput, setCustomCommandInput] = useState("");

    const handleErrorOutput = (error: unknown) => {
        if (error instanceof Error) {
            const match = error.message.match(/Error invoking remote method '[^']+': (.+)/);
            if (match) {
                try {
                    const innerError = JSON.parse(match[1]);
                    return String(innerError.stderr || innerError.message || error.message);
                } catch {
                    return error.message;
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
                terminal.write(String(output.stdout || output.stderr || output) + "\r\n> ");
            } catch (error) {
                terminal.write(`${handleErrorOutput(error)}\r\n> `);
            }
        }
    };

    const handleRecoveryDevicesClick = async () => {
        if (terminal) {
            terminal.write("adb reboot recovery\r\n");
            try {
                const output = await window.electron.ipcRenderer.invoke("run-adb-command", "reboot recovery");
                terminal.write(String(output.stdout || output.stderr || output) + "\r\n\r\n> ");
            } catch (error) {
                terminal.write(`${handleErrorOutput(error)}\r\n\r\n> `);
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
                terminal.write(String(output.stdout || output.stderr || output) + "\r\n\r\n> ");
            } catch (error) {
                terminal.write(`${handleErrorOutput(error)}\r\n\r\n> `);
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
            return;
        }
        if (terminal) {
            terminal.write("adb sideload \"" + filePath + "\"\r\n");
            try {
                // Create a progress bar line in the terminal
                terminal.write("Progress: [                                        ] 0%\r");
                
                const output = await window.electron.ipcRenderer.invoke("run-adb-command", "sideload \"" + filePath + "\"", {
                    onProgress: (progress: string) => {
                        // Parse the progress percentage from ADB output
                        const match = progress.match(/(\d+)%/);
                        if (match) {
                            const percent = parseInt(match[1], 10);
                            const filled = Math.floor(percent / 2.5);
                            const empty = 40 - filled;
                            const bar = "=".repeat(filled) + ">".padEnd(empty);
                            terminal.write(`\rProgress: [${bar}] ${percent}%`);
                        }
                    }
                });
                terminal.write("\r\n" + String(output.stdout || output.stderr || output) + "\r\n\r\n> ");
            } catch (error) {
                terminal.write(`\r\n${handleErrorOutput(error)}\r\n\r\n> `);
            }
        }
    };

    const commandHandler = async (cmd: string) => {
        try {
            const actualCmd = cmd.toLowerCase().startsWith("adb ") ? cmd.slice(4).trim() : cmd.trim();
            console.log("actualCmd", actualCmd);
            const output = await window.electron.ipcRenderer.invoke("run-adb-command", actualCmd);
            return String(output.stdout || output.stderr || output);
        } catch (error) {
            return handleErrorOutput(error);
        }
    };

    useEffect(() => {
        window.ContextBridge.onNativeThemeChanged(() => setTheme(getTheme()));

        const handleAdbError = (_event: unknown, message: unknown): void => {
            if (typeof message === "string") {
                setDialogTitle("Device Connection Error");
                setDialogMessage(message);
                setIsDialogOpen(true);
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
                    background: "rgba(0, 0, 0, 0)"
                },
                cursorInactiveStyle: "bar",
                disableStdin: true,
                rows: 39,
                cols: 59,
                rightClickSelectsWord: true,
                cursorBlink: true
            });

            const clipboardAddon = new ClipboardAddon();
            term.loadAddon(clipboardAddon);

            terminalRef.current.addEventListener('contextmenu', (event) => {
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
                            term.write("\r\n" + output + "\r\n> ");
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

    return (
        <FluentProvider theme={theme} className={styles.fluentProvider}>
            <div className={styles.main}>
                <div className={styles.sidebar}>
                    <div>
                        <Title1 className={styles.title}>MinimalADB</Title1>
                        <a href="https://github.com/beecho01/MinimalADB" target="_blank" rel="noopener noreferrer">
                            <img className={styles.image} src="assets/github-mark-white.png" />
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
                        <Button appearance="primary" onClick={handleSideloadClick}>Flash device</Button>
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
                    <div className={styles.terminal} ref={terminalRef} spellCheck={false} />
                    <Dialog open={isDialogOpen} modalType="alert">
                        <DialogSurface>
                            <DialogBody>
                                <DialogTitle>{dialogTitle}</DialogTitle>
                                <DialogContent>
                                    {dialogMessage}
                                </DialogContent>
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
