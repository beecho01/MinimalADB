import { Terminal } from "@xterm/xterm";

export const handleFileSelect = async (setFilePath: (path: string) => void) => {
  const { canceled, filePaths } = await window.electron.ipcRenderer.invoke("show-open-dialog");
  if (!canceled && filePaths.length > 0) {
    setFilePath(filePaths[0]);
  }
};

export const handleSideloadClick = async (
  filePath: string,
  terminal: Terminal | null,
  showDialog: (title: string, message: React.ReactNode) => void,
) => {
  if (!filePath) {
    showDialog("No File Selected", "Please select a file to sideload first.");
    return;
  }
  window.electron.ipcRenderer.send("sideload-file", filePath);
  if (terminal) {
    terminal.write(`adb sideload "${filePath}"\r\n`);
  }
};

export const handleSaveTerminalContents = async (
  terminal: Terminal | null,
  showDialog: (title: string, message: React.ReactNode) => void,
) => {
  if (!terminal) return;

  const lines: string[] = [];
  for (let i = 0; i < terminal.buffer.active.length; i++) {
    const line = terminal.buffer.active.getLine(i);
    if (line) {
      lines.push(line.translateToString());
    }
  }

  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }
  const content = lines.join("\n");

  try {
    const result = await window.electron.ipcRenderer.invoke("show-save-dialog", {
      filters: [
        { name: "Text Files", extensions: ["txt"] },
        { name: "Log Files", extensions: ["log"] },
      ],
      defaultPath: `terminal_output_${new Date().toISOString().replace(/[:.]/g, "-")}.txt`,
    });

    if (!result.canceled && result.filePath) {
      await window.electron.ipcRenderer.invoke("save-file", {
        filePath: result.filePath,
        content: content,
      });
    }
  } catch (error) {
    showDialog("Save Error", "Failed to save terminal contents: " + String(error));
  }
};
