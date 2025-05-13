import {
  makeStyles,
  Menu,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  tokens,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
} from "@fluentui/react-components";
import { ArrowResetRegular, MoreHorizontalFilled, SaveRegular } from "@fluentui/react-icons";
import { Terminal } from "@xterm/xterm";
import React from "react";

const useStyles = makeStyles({
  toolbar: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "row-reverse",
    appRegion: "no-drag",
    margin: "0px",
    padding: "0px",
  },
  menuVersions: {
    marginLeft: tokens.spacingHorizontalSNudge,
    userSelect: "none",
    padding: tokens.spacingVerticalSNudge,
  },
});

interface ToolbarComponentProps {
  terminal: Terminal | null;
  appVersion: string;
  adbVersion: string;
  onSaveTerminalContents: () => void;
  showLicenseDialog: () => void;
}

export const ToolbarComponent: React.FC<ToolbarComponentProps> = ({
  terminal,
  appVersion,
  adbVersion,
  onSaveTerminalContents,
  showLicenseDialog,
}) => {
  const styles = useStyles();

  return (
    <Toolbar className={styles.toolbar}>
      <Menu>
        <MenuTrigger>
          <ToolbarButton aria-label="More" icon={<MoreHorizontalFilled />} />
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <div className={styles.menuVersions}>MinimalADB Version: {appVersion}</div>
            <MenuItem disabled={true}>Check for MinimalADB Updates</MenuItem>
            <MenuDivider />
            <div className={styles.menuVersions}>Current ADB Version: {adbVersion}</div>
            <MenuItem disabled={true}>Get Latest Platform Tools</MenuItem>
            <MenuDivider />
            <MenuItem onClick={showLicenseDialog}>Software License Details</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
      <ToolbarDivider />
      <ToolbarButton aria-label="Save Terminal Contents" icon={<SaveRegular />} onClick={onSaveTerminalContents} />
      <ToolbarButton
        aria-label="Reset Terminal Contents"
        icon={<ArrowResetRegular />}
        onClick={() => {
          terminal?.reset();
          terminal?.write("> ");
        }}
      />
    </Toolbar>
  );
};
