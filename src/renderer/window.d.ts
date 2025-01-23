import type { ContextBridge } from "@common/ContextBridge";

export declare global {
    interface Window {
        ContextBridge: ContextBridge;
        electron: {
            invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
            send: (channel: string, ...args: unknown[]) => void;
            on: (channel: string, listener: (...args: unknown[]) => void) => void;
        };
    }
}