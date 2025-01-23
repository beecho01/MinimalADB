export type ContextBridge = {
    onNativeThemeChanged: (callback: () => void) => void;
    themeShouldUseDarkColors: () => boolean;
    on: (channel: string, listener: (...args: unknown[]) => void) => void;
};
