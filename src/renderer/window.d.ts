import type { ContextBridge } from "@common/ContextBridge";

export declare global {
  interface Window {
    ContextBridge: ContextBridge;
    electron: {
      ipcRenderer: {
        removeListener(arg0: string, onProgress: (_event: unknown, data: string) => void): unknown;
        invoke(channel: "show-open-dialog"): Promise<{ canceled: boolean; filePaths: string[] }>;
        invoke(
          channel: "run-adb-command",
          command: string,
          options?: { onProgress?: (progress: string) => void },
        ): Promise<{ stdout: string; stderr: string }>;
        invoke(channel: "get-source-properties"): Promise<string>;
        invoke(channel: "get-app-version"): Promise<string>;
        invoke(channel: "is-mica-supported"): Promise<boolean>;
        send: (channel: string, ...args: unknown[]) => void;
        on: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void;
        removeAllListeners: (channel: string) => void;
        removeListener: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void;
        invoke(
          channel: "show-save-dialog",
          options: Electron.SaveDialogOptions,
        ): Promise<Electron.SaveDialogReturnValue>;
        invoke(channel: "save-file", options: { filePath: string; content: string }): Promise<void>;
      };
    };
  }
}
