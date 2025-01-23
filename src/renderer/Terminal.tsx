import { makeStyles } from "@fluentui/react-components";
import { useEffect, useRef } from "react";
import isHidden from "licia/isHidden";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "@xterm/addon-fit";
import { CanvasAddon } from "@xterm/addon-canvas";
import { WebglAddon } from "@xterm/addon-webgl";
import { Unicode11Addon } from "@xterm/addon-unicode11";
import "xterm/css/xterm.css";
import "jetbrains-mono/css/jetbrains-mono.css";
import "./Terminal.css";

const useStyles = makeStyles({
    terminal: {
        display: "flex",
        flexGrow: 1,
        gap: 0,
        padding: 0,
        margin: 0,
        marginRight: "-20px",
        overflow: "hidden",
        appRegion: "no-drag",
    },
});

export const Terminal = () => {
    const styles = useStyles();
    const terminalRef = useRef<HTMLDivElement | null>(null);
    const fitAddonRef = useRef<FitAddon>();
    const xtermRef = useRef<XTerm>();

    useEffect(() => {
        const terminal = new XTerm({
            allowProposedApi: true,
            fontSize: 14,
            cursorBlink: false,
            fontFamily: "Jetbrains Mono",
            theme: {
                background: "#000000",
                foreground: "green",
                cursor: "#000000",
            },
            disableStdin: true, // Disable user input
        });
        xtermRef.current = terminal;
    
        const fitAddon = new FitAddon();
        fitAddonRef.current = fitAddon;
        terminal.loadAddon(fitAddon);
    
        const fit = () => {
            if (terminalRef.current && !isHidden(terminalRef.current)) {
                fitAddon.fit();
            }
        };
        window.addEventListener("resize", fit);
    
        terminal.loadAddon(new Unicode11Addon());
        terminal.unicode.activeVersion = "11";
    
        try {
            terminal.loadAddon(new WebglAddon());
        } catch {
            terminal.loadAddon(new CanvasAddon());
        }
    
        if (terminalRef.current) {
            terminal.open(terminalRef.current);
            fitAddon.fit();
            terminal.write("🎉 Welcome to MinimalADB Terminal 🎉\r\n");
        }
    
        // ADB output handling
        window.electron.on("adb-stream-data", (...args: unknown[]) => {
            const message = args[0];
            if (typeof message === "string") {
                terminal.write(message.replace(/\n/g, "\r\n"));
            }
        });
    
        window.electron.on("adb-stream-error", (...args: unknown[]) => {
            const error = args[0];
            if (typeof error === "string") {
                terminal.write(`\r\n[Error] ${error.replace(/\n/g, "\r\n")}\r\n`);
            }
        });
    
        window.electron.on("adb-stream-end", (...args: unknown[]) => {
            const message = args[0];
            if (typeof message === "string") {
                terminal.write(`\r\n[Process End] ${message.replace(/\n/g, "\r\n")}\r\n`);
            }
        });
    
        return () => {
            window.removeEventListener("resize", fit);
            terminal.dispose();
        };
    }, []);  

    return <div className={styles.terminal} ref={terminalRef}></div>;
};
