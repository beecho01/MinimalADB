import { Terminal } from "@xterm/xterm";

export const handleAdbDevicesClick = async (terminal: Terminal | null) => {
  if (!terminal) return;

  terminal.write("adb devices\r\n");
  try {
    const output = await window.electron.ipcRenderer.invoke("run-adb-command", "devices");
    terminal.write("\x1b[32m");
    terminal.write(String(output.stdout || output.stderr || output));
    terminal.write("\x1b[0m");
    terminal.write("\r> ");
  } catch (error) {
    terminal.write("\x1b[31m");
    terminal.write(`${handleErrorOutput(error)}`);
    terminal.write("\x1b[0m");
    terminal.write("\r> ");
  }
};

export const handleRecoveryDevicesClick = async (terminal: Terminal | null) => {
  if (!terminal) return;

  terminal.write("adb reboot recovery\r\n");
  try {
    const output = await window.electron.ipcRenderer.invoke("run-adb-command", "reboot recovery");
    terminal.write("\x1b[32m");
    const outputStr = output.stdout || output.stderr || "Device is rebooting to recovery mode";
    terminal.write(outputStr);
    terminal.write("\x1b[0m");
    terminal.write("\r\n\r\n> ");
  } catch (error) {
    terminal.write("\x1b[31m");
    terminal.write(`${handleErrorOutput(error)}`);
    terminal.write("\x1b[0m");
    terminal.write("\r\n\r\n> ");
  }
};

export const handleCustomCommandClick = async (
  terminal: Terminal | null,
  customCommandInput: string,
  setCustomCommandInput: (value: string) => void,
) => {
  if (!terminal || !customCommandInput.trim()) return;

  terminal.write(customCommandInput + "\r\n");
  try {
    const actualCmd = customCommandInput.toLowerCase().startsWith("adb ")
      ? customCommandInput.slice(4).trim()
      : customCommandInput.trim();

    const output = await window.electron.ipcRenderer.invoke("run-adb-command", actualCmd);
    terminal.write("\x1b[32m");
    terminal.write(String(output.stdout || output.stderr || output));
    terminal.write("\x1b[0m");
    terminal.write("\r\n\r\n> ");
  } catch (error) {
    terminal.write("\x1b[31m");
    terminal.write(`${handleErrorOutput(error)}`);
    terminal.write("\x1b[0m");
    terminal.write("\r\n\r\n> ");
  }
  setCustomCommandInput("");
};

export const commandHandler = async (cmd: string) => {
  try {
    const actualCmd = cmd.toLowerCase().startsWith("adb ") ? cmd.slice(4).trim() : cmd.trim();
    const output = await window.electron.ipcRenderer.invoke("run-adb-command", actualCmd);
    return String(output.stdout || output.stderr || output);
  } catch (error) {
    return handleErrorOutput(error);
  }
};

export const handleErrorOutput = (error: unknown) => {
  if (error instanceof Error) {
    const match = error.message.match(/Error invoking remote method '[^']+': (?:Error: )?(.*)/);
    if (match) {
      try {
        const innerError = JSON.parse(match[1]);
        return String(innerError.stderr || innerError.message || match[1]);
      } catch {
        return match[1];
      }
    }
  }
  return String(error);
};
