export const getAdbVersion = async (setAdbVersion: (version: string) => void) => {
  try {
    const versionLine = await window.electron.ipcRenderer.invoke("get-source-properties");
    const adbVersion = versionLine.split("=")[1] || "Unknown";
    setAdbVersion(adbVersion);
    return adbVersion;
  } catch {
    setAdbVersion("ADB Version: Unknown");
    return "Unknown";
  }
};

export const getAppVersion = async (setAppVersion: (version: string) => void) => {
  try {
    const appVersion = await window.electron.ipcRenderer.invoke("get-app-version");
    setAppVersion(appVersion);
    return appVersion;
  } catch {
    setAppVersion("App Version: Unknown");
    return "Unknown";
  }
};
