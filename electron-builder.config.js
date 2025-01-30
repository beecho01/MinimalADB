/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const baseConfig = {
    appId: "uk.co.beecho01.MinimalADB",
    productName: "MinimalADB",
    directories: {
        output: "release",
        buildResources: "build",
    },
    files: ["dist-main/index.js", "dist-preload/index.js", "dist-renderer/**/*"],
    extraMetadata: {
        version: process.env.VITE_APP_VERSION,
    },
};

/**
 * @type {Record<NodeJS.Platform, import('electron-builder').Configuration>}
 */
const platformSpecificConfigurations = {
    win32: {
        ...baseConfig,
        win: {
            icon: "build/app-icon-dark.png", // Path to your Windows icon
            target: [
                { target: "msi" }, // Build MSI installer
                { target: "zip" }, // Build ZIP archive
            ],
        },
    },
};

// Ensure we only export valid configurations for supported platforms
const config = platformSpecificConfigurations[process.platform];
if (!config) {
    throw new Error(
        `Unsupported platform: ${process.platform}. This application is configured to build only for Windows.`
    );
}

module.exports = config;