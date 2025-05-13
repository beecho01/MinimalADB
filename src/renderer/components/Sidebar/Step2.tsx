import { Body1Strong, Button, Card, CardHeader, makeStyles, tokens } from "@fluentui/react-components";
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
});

interface Step2Props {
  onRecoveryDevicesClick: () => void;
}

export const Step2: React.FC<Step2Props> = ({ onRecoveryDevicesClick }) => {
  const styles = useStyles();

  return (
    <Card appearance="subtle" className={styles.card}>
      <CardHeader header={<Body1Strong className={styles.stepHeader}>Step 2</Body1Strong>} />
      <caption className={styles.stepCaption}>Reboot into recovery mode.</caption>
      <Button onClick={onRecoveryDevicesClick} appearance="primary">
        Reboot Recovery
      </Button>
    </Card>
  );
};
