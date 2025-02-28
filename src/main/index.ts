import { Adb } from "@devicefarmer/adbkit";
import { spawn } from "child_process";
import { BrowserWindow, IpcMainEvent, app, dialog, ipcMain, nativeTheme } from "electron";
import { readFileSync } from "fs";
import fs from "fs/promises";
import os from "os";
import { join } from "path";

// Is development mode?
const isDev = !!process.env.VITE_DEV_SERVER_URL;

// Determine if Mica (Windows 11) is supported:
function isMicaSupported() {
    if (process.platform !== "win32") return false;

    // "os.release()" typically looks like "10.0.22621" on Windows
    const [major, , build] = os
        .release()
        .split(".")
        .map((x) => parseInt(x, 10));

    // Windows 11 has build >= 22000
    return major > 10 || (major === 10 && build >= 22000);
}

// Determine where "platform-tools" lives in dev vs. production
function getPlatformToolsPath() {
    if (isDev) {
        return join(__dirname, "..", "platform-tools");
    }
    // In a packaged app, platform-tools is copied to resources/
    return join(process.resourcesPath, "platform-tools");
}

// Determine where "platform-tools" folder is located
const platformToolsPath = getPlatformToolsPath();

// Determine ADB path
export const adbPath = process.env.ADB_PATH || join(platformToolsPath, "adb.exe");
export const sourcePropertiesPath = join(platformToolsPath, "source.properties");

// Create ADB client
const client = Adb.createClient();

// Create the browser window
const createBrowserWindow = (): BrowserWindow => {
    const preloadScriptFilePath = isDev
        ? join(__dirname, "..", "dist-preload", "index.js")
        : join(process.resourcesPath, "dist-preload", "index.js");

    const iconPath = isDev
        ? join(__dirname, "..", "build", "app-icon-dark.png")
        : join(process.resourcesPath, "build", "app-icon-dark.png");

    const useMica = isMicaSupported();
    // Fallback background color (dark vs. light)
    const fallbackColor = nativeTheme.shouldUseDarkColors ? "#2c2c2c" : "#ffffff";

    return new BrowserWindow({
        autoHideMenuBar: true,

        // Use Mica only on Win11, otherwise fallback to a solid color
        backgroundMaterial: useMica ? "mica" : undefined,
        vibrancy: useMica ? "header" : undefined,
        backgroundColor: useMica ? undefined : fallbackColor,

        frame: false,
        roundedCorners: true,
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
        icon: iconPath,
    });
};

// Load the index.html of the app
const loadFileOrUrl = (browserWindow: BrowserWindow) => {
    if (process.env.VITE_DEV_SERVER_URL) {
        browserWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        const indexHtmlPath = isDev
            ? join(__dirname, "..", "dist-renderer", "index.html")
            : join(process.resourcesPath, "dist-renderer", "index.html");
        browserWindow.loadFile(indexHtmlPath);
    }
};

// Register IPC event listeners
const registerIpcEventListeners = () => {
    ipcMain.handle("run-adb-command", async (_event, command: string) => {
        return new Promise((resolve, reject) => {
            let args: string[];
            if (command.startsWith("sideload ")) {
                const filePath = command.substring(9).trim().replace(/^"|"$/g, "");
                args = ["sideload", filePath];
            } else {
                args = command.split(/\s+/).filter(Boolean);
            }

            const adbProcess = spawn(adbPath, args);
            let stdout = "";
            let stderr = "";

            adbProcess.stdout.on("data", (data) => {
                stdout += data.toString();
            });

            adbProcess.stderr.on("data", (data) => {
                stderr += data.toString();
            });

            adbProcess.on("close", (code) => {
                if (code === 0) {
                    resolve({ stdout, stderr });
                } else {
                    reject(new Error(stderr || stdout));
                }
            });

            adbProcess.on("error", (error) => {
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
            return devices.map((device: { id: unknown; type: unknown }) => ({
                id: device.id,
                type: device.type,
            }));
        } catch (error) {
            console.error("Error listing devices:", error);
            return [];
        }
    });

    // Sideload file
    ipcMain.on("sideload-file", (event, filePath: string) => {
        const adbProcess = spawn(adbPath, ["sideload", filePath]);

        adbProcess.stdout.on("data", (data) => {
            const outputStr = data.toString();
            const match = outputStr.match(/(\d+)%/);
            if (match) {
                const percent = parseInt(match[1], 10);
                event.sender.send("sideload-progress", { percent });
            } else {
                event.sender.send("sideload-stdout", outputStr);
            }
        });

        adbProcess.stderr.on("data", (data) => {
            const outputStr = data.toString();
            event.sender.send("sideload-stderr", outputStr);
        });

        adbProcess.on("close", (code) => {
            event.sender.send("sideload-complete", {
                code,
                success: code === 0,
            });
        });

        adbProcess.on("error", (error) => {
            event.sender.send("sideload-error", error.message);
        });
    });

    // Handle running shell commands on a device
    ipcMain.handle(
        "run-shell-command",
        async (_event, { deviceId, command }: { deviceId: string; command: string }) => {
            const device = client.getDevice(deviceId);
            const outputBuffer = await device.shell(command).then(Adb.util.readAll);
            return outputBuffer.toString().trim();
        },
    );

    // Dialog handlers
    ipcMain.handle("show-open-dialog", async () => {
        const result = await dialog.showOpenDialog({
            properties: ["openFile"],
            filters: [{ name: "ZIP Files", extensions: ["zip"] }],
        });
        return result;
    });

    ipcMain.handle("get-app-version", async () => {
        return app.getVersion();
    });

    ipcMain.handle("get-source-properties", async () => {
        try {
            const content = readFileSync(sourcePropertiesPath, "utf8");
            const lines = content.split("\n");
            const revisionLine = lines.find((line) => line.startsWith("Pkg.Revision="));
            return revisionLine || "";
        } catch (error) {
            console.error("Error reading source.properties:", error);
            return "";
        }
    });

    ipcMain.handle("show-save-dialog", async (_event, options) => {
        const result = await dialog.showSaveDialog(options);
        return result;
    });

    ipcMain.handle("save-file", async (_event, { filePath, content }) => {
        await fs.writeFile(filePath, content, "utf8");
    });

    ipcMain.handle("is-mica-supported", () => {
        return isMicaSupported();
    });
};

// Register native theme event listeners
const registerNativeThemeEventListeners = () => {
    nativeTheme.addListener("updated", () => {
        for (const browserWindow of BrowserWindow.getAllWindows()) {
            browserWindow.webContents.send("nativeThemeChanged");
        }
    });
};

(async () => {
    await app.whenReady();

    registerIpcEventListeners();

    const mainWindow = createBrowserWindow();
    loadFileOrUrl(mainWindow);

    registerNativeThemeEventListeners();

    // Quit when all windows are closed (unless macOS)
    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            app.quit();
        }
    });

    // Re-create a window in the app when the dock icon is clicked and there are no other windows open (macOS behavior).
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createBrowserWindow();
        }
    });
})();
