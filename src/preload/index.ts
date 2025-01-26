import type { ContextBridge as commonContextBridge } from "@common/ContextBridge";
import { contextBridge, ipcRenderer } from "electron";

// Ensure the ContextBridge type includes all necessary methods
export interface ContextBridge {
    onNativeThemeChanged: (callback: () => void) => void;
    themeShouldUseDarkColors: () => boolean;
    on: (channel: string, listener: (...args: unknown[]) => void) => void;
}

// Expose ContextBridge functionality
contextBridge.exposeInMainWorld("ContextBridge", <commonContextBridge>{
    onNativeThemeChanged: (callback: () => void) => {
        ipcRenderer.on("nativeThemeChanged", callback);
    },
    themeShouldUseDarkColors: () => {
        return ipcRenderer.sendSync("themeShouldUseDarkColors");
    },
    on: (channel: string, listener: (...args: unknown[]) => void) => {
        ipcRenderer.on(channel, listener);
    },
});

// Expose additional Electron functionality
contextBridge.exposeInMainWorld("electron", {
    ipcRenderer: {
        invoke: (channel: string, ...args: unknown[]) => {
            if (channel === 'run-adb-command') {
                return ipcRenderer.invoke(channel, ...args);
            }
            return ipcRenderer.invoke(channel, ...args);
        },
        send: (channel: string, ...args: unknown[]) => ipcRenderer.send(channel, ...args),
        on: (channel: string, listener: (...args: unknown[]) => void) => ipcRenderer.on(channel, listener),
    },
    send: (channel: string, ...args: unknown[]) => ipcRenderer.send(channel, ...args),
    on: (channel: string, listener: (...args: unknown[]) => void) => ipcRenderer.on(channel, listener),
});
