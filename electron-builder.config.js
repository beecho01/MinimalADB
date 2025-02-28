const baseConfig = {
    appId: "uk.co.beecho01.MinimalADB",
    productName: "MinimalADB",
    directories: {
      output: "release",
      buildResources: "build",
    },
    files: [
      "dist-main/index.js",
      "dist-preload/index.js",
      "dist-renderer/**/*"
    ],
    extraResources: [
      {
        from: "platform-tools",
        to: "platform-tools",
        filter: ["**/*"]
      }
    ],
    extraMetadata: {
      version: process.env.VITE_APP_VERSION,
    },
  };
  
  const platformSpecificConfigurations = {
    win32: {
      ...baseConfig,
      win: {
        icon: "build/app-icon-dark.png",
        target: [
          { target: "msi" },
          { target: "zip" },
        ],
      },
    },
  };
  
  const config = platformSpecificConfigurations[process.platform];
  if (!config) {
    throw new Error(
      `Unsupported platform: ${process.platform}. This application is configured to build only for Windows.`
    );
  }
  
  module.exports = config;  