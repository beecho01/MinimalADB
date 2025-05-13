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

interface Step4Props {
  onSideloadClick: () => void;
}

export const Step4: React.FC<Step4Props> = ({ onSideloadClick }) => {
  const styles = useStyles();

  return (
    <Card appearance="subtle" className={styles.card}>
      <CardHeader header={<Body1Strong className={styles.stepHeader}>Step 4</Body1Strong>} />
      <caption className={styles.stepCaption}>Sideload the ROM file to your device.</caption>
      <Button appearance="primary" onClick={onSideloadClick}>
        Flash device
      </Button>
    </Card>
  );
};
