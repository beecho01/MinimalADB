import { Divider, makeStyles, webDarkTheme, type Theme } from "@fluentui/react-components";
import React from "react";
import { CustomCommand } from "./CustomCommand";
import { Step1 } from "./Step1";
import { Step2 } from "./Step2";
import { Step3 } from "./Step3";
import { Step4 } from "./Step4";

const useStyles = makeStyles({
  sidebar: {
    height: "100%",
    width: "400px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    padding: "0px 20px 20px 40px",
    boxSizing: "border-box",
    flexShrink: 0,
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: "8px",
      appRegion: "no-drag !important",
      userSelect: "all",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(155, 155, 155, 0.5)",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: "rgba(155, 155, 155, 0.8)",
    },
  },
  image: {
    marginLeft: "15px",
    width: "32px",
    height: "32px",
    marginBottom: "-4px",
    appRegion: "no-drag",
    opacity: 0.2,
    userSelect: "none",
  },
  logo: {
    height: "44px",
    marginBottom: "-12px",
    paddingTop: "8px",
  },
});

interface SidebarProps {
  theme: Theme;
  filePath: string;
  customCommandInput: string;
  onAdbDevicesClick: () => void;
  onRecoveryDevicesClick: () => void;
  onFileSelect: () => void;
  onSideloadClick: () => void;
  onCustomCommandChange: (value: string) => void;
  onCustomCommandClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  theme,
  filePath,
  customCommandInput,
  onAdbDevicesClick,
  onRecoveryDevicesClick,
  onFileSelect,
  onSideloadClick,
  onCustomCommandChange,
  onCustomCommandClick,
}) => {
  const styles = useStyles();
  const isDarkTheme = theme === webDarkTheme;

  return (
    <div className={styles.sidebar}>
      <div>
        {isDarkTheme ? (
          <img src="assets/MinimalADB_White_Small.png" alt="MinimalADB Logo" className={styles.logo} />
        ) : (
          <img src="assets/MinimalADB_Black_Small.png" alt="MinimalADB Logo" className={styles.logo} />
        )}
        <a href="https://github.com/beecho01/MinimalADB" target="_blank" rel="noopener noreferrer">
          <img
            className={styles.image}
            src={isDarkTheme ? "assets/github-mark-white.png" : "assets/github-mark-black.png"}
          />
        </a>
      </div>

      <Step1 onAdbDevicesClick={onAdbDevicesClick} />
      <Step2 onRecoveryDevicesClick={onRecoveryDevicesClick} />
      <Step3 filePath={filePath} onFileSelect={onFileSelect} />
      <Step4 onSideloadClick={onSideloadClick} />

      <Divider />

      <CustomCommand
        customCommandInput={customCommandInput}
        onCustomCommandChange={onCustomCommandChange}
        onCustomCommandClick={onCustomCommandClick}
      />
    </div>
  );
};
