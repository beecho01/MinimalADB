import type { ContextBridge } from "@common/ContextBridge";

export declare global {
    interface Window {
        ContextBridge: ContextBridge;
        electron: {
            ipcRenderer: {
                invoke(channel: "show-open-dialog"): Promise<{ canceled: boolean; filePaths: string[] }>;
                invoke(
                    channel: "run-adb-command",
                    command: string,
                    options?: { onProgress?: (progress: string) => void },
                ): Promise<{ stdout: string; stderr: string }>;
                invoke(channel: "get-source-properties"): Promise<string>;
                invoke(channel: "get-app-version"): Promise<string>;
                send: (channel: string, ...args: unknown[]) => void;
                on: (channel: string, listener: (...args: unknown[]) => void) => void;
                invoke(
                    channel: "show-save-dialog",
                    options: Electron.SaveDialogOptions,
                ): Promise<Electron.SaveDialogReturnValue>;
                invoke(channel: "save-file", options: { filePath: string; content: string }): Promise<void>;
            };
        };
    }
}
