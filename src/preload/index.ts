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
    invoke: async (channel: string, ...args: unknown[]) => {
      const validChannels = [
        "show-open-dialog",
        "run-adb-command",
        "get-source-properties",
        "get-app-version",
        "show-save-dialog",
        "is-mica-supported",
        "save-file",
      ];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      throw new Error(`Invalid channel: ${channel}`);
    },
    send: (channel: string, ...args: unknown[]) => ipcRenderer.send(channel, ...args),
    on: (channel: string, listener: (...args: unknown[]) => void) => ipcRenderer.on(channel, listener),
  },
  send: (channel: string, ...args: unknown[]) => ipcRenderer.send(channel, ...args),
  on: (channel: string, listener: (...args: unknown[]) => void) => ipcRenderer.on(channel, listener),
});
