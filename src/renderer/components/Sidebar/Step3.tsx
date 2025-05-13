import { Body1Strong, Button, Card, CardHeader, Input, makeStyles, tokens } from "@fluentui/react-components";
import React from "react";

const useStyles = makeStyles({
  card: {
    maxWidth: "100%",
    height: "fit-content",
    padding: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingHorizontalMNudge,
    appRegion: "no-drag",
    minHeight: "128px",
  },
  stepHeader: {
    appRegion: "no-drag",
    userSelect: "none",
  },
  stepCaption: {
    color: tokens.colorNeutralForeground3,
    textAlign: "left",
    appRegion: "no-drag",
    userSelect: "none",
  },
  fileContainer: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    width: "100%",
    appRegion: "no-drag",
  },
  filePath: {
    flexGrow: 1,
    minWidth: "0",
    appRegion: "no-drag",
  },
  filebutton: {
    flexShrink: 0,
    appRegion: "no-drag",
  },
});

interface Step3Props {
  filePath: string;
  onFileSelect: () => void;
}

export const Step3: React.FC<Step3Props> = ({ filePath, onFileSelect }) => {
  const styles = useStyles();

  return (
    <Card appearance="subtle" className={styles.card}>
      <CardHeader header={<Body1Strong className={styles.stepHeader}>Step 3</Body1Strong>} />
      <caption className={styles.stepCaption}>Pick your ROM zip file to install.</caption>
      <div className={styles.fileContainer}>
        <Input
          className={styles.filePath}
          type="text"
          value={filePath}
          readOnly
          placeholder="File Path"
          appearance="filled-darker"
        />
        <Button className={styles.filebutton} appearance="primary" onClick={onFileSelect}>
          Select
        </Button>
      </div>
    </Card>
  );
};
