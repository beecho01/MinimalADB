import { Body1Strong, Button, Card, CardHeader, makeStyles, tokens } from "@fluentui/react-components";
import React from "react";

const useStyles = makeStyles({
  stepCard: {
    maxWidth: "100%",
    height: "fit-content",
    appRegion: "no-drag",
    minHeight: "120px",
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
});

interface Step1Props {
  onAdbDevicesClick: () => void;
}

export const Step1: React.FC<Step1Props> = ({ onAdbDevicesClick }) => {
  const styles = useStyles();

  return (
    <Card appearance="subtle" className={styles.stepCard}>
      <CardHeader header={<Body1Strong className={styles.stepHeader}>Step 1</Body1Strong>} />
      <caption className={styles.stepCaption}>Confirm your device is connected via ADB.</caption>
      <Button onClick={onAdbDevicesClick} appearance="primary" value="adb devices">
        ADB devices
      </Button>
    </Card>
  );
};
