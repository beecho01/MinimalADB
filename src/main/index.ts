import { BrowserWindow, IpcMainEvent, app, ipcMain, nativeTheme, dialog } from "electron";
import { join } from "path";
import { Adb } from '@devicefarmer/adbkit';
import { spawn } from "child_process";

export const adbPath = process.env.ADB_PATH || join(__dirname, "..", "platform-tools", "adb.exe");

const client = Adb.createClient();

const createBrowserWindow = (): BrowserWindow => {
    const preloadScriptFilePath = join(__dirname, "..", "dist-preload", "index.js");

    return new BrowserWindow({
        autoHideMenuBar: true,
        backgroundMaterial: "mica",
        vibrancy: "header",
        frame: false,
        height: 870,
        width: 1000,
        resizable: false,
        titleBarStyle: "hidden",
        maximizable: false,
        titleBarOverlay: {
            color: nativeTheme.shouldUseDarkColors ? "rgba(0, 0, 0, 0)" : "rgba(255, 255, 255, 0)",
            symbolColor: nativeTheme.shouldUseDarkColors ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 1)",
        },
        webPreferences: {
            preload: preloadScriptFilePath,
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: join(__dirname, "..", "build", "app-icon-dark.png"),
    });
};

const loadFileOrUrl = (browserWindow: BrowserWindow) => {
    if (process.env.VITE_DEV_SERVER_URL) {
        browserWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        browserWindow.loadFile(join(__dirname, "..", "dist-renderer", "index.html"));
    }
};

const registerIpcEventListeners = () => {
    ipcMain.handle("run-adb-command", async (_event, command: string, options?: { onProgress?: (progress: string) => void }) => {
        return new Promise((resolve, reject) => {
            const args = command.split(' ').filter(arg => arg);
            const adbProcess = spawn(adbPath, args);
            
            let stdout = '';
            let stderr = '';

            adbProcess.stdout.on('data', (data) => {
                const output = data.toString();
                stdout += output;
                if (options?.onProgress && command.includes('sideload')) {
                    options.onProgress(output);
                }
            });

            adbProcess.stderr.on('data', (data) => {
                const output = data.toString();
                stderr += output;
                if (options?.onProgress && command.includes('sideload')) {
                    options.onProgress(output);
                }
            });

            adbProcess.on('close', (code) => {
                if (code === 0) {
                    resolve({ stdout, stderr });
                } else {
                    reject(new Error(stderr || stdout));
                }
            });

            adbProcess.on('error', (error) => {
                reject(error);
            });
        });
    });

    // Theme-related event
    ipcMain.on("themeShouldUseDarkColors", (event: IpcMainEvent) => {
        event.returnValue = nativeTheme.shouldUseDarkColors;
    });

    // Handle ADB device listing
    ipcMain.handle("list-devices", async () => {
        try {
            const devices = await client.listDevices();
            return devices.map((device: { id: unknown; type: unknown; }) => ({ id: device.id, type: device.type }));
        } catch (error) {
            console.error("Failed to list devices:", error);
            throw error;
        }
    });

    // Handle running shell commands on a device
    ipcMain.handle("run-shell-command", async (event, { deviceId, command }: { deviceId: string; command: string }) => {
        try {
            const device = client.getDevice(deviceId);
            const outputBuffer = await device.shell(command).then(Adb.util.readAll);
            return outputBuffer.toString().trim();
        } catch (error) {
            console.error(`Error running shell command: ${command} on device ${deviceId}`, error);
            throw error;
        }
    });

    ipcMain.handle('show-open-dialog', async () => {
        const result = await dialog.showOpenDialog({
            properties: ["openFile"],
            filters: [{ name: "ZIP Files", extensions: ["zip"] }],
        });
        return result;
    });
};


const registerNativeThemeEventListeners = (allBrowserWindows: BrowserWindow[]) => {
    nativeTheme.addListener("updated", () => {
        for (const browserWindow of allBrowserWindows) {
            browserWindow.webContents.send("nativeThemeChanged");
        }
    });
};

(async () => {
    await app.whenReady();
    const mainWindow = createBrowserWindow();
    loadFileOrUrl(mainWindow);
    registerIpcEventListeners();
    registerNativeThemeEventListeners(BrowserWindow.getAllWindows());
})();