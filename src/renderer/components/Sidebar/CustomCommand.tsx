import { Body1Strong, Button, Card, CardHeader, Input, makeStyles, tokens } from "@fluentui/react-components";
import { SendRegular } from "@fluentui/react-icons";
import React, { useEffect, useState } from "react";

const useStyles = makeStyles({
  card: {
    maxWidth: "100%",
    height: "fit-content",
    padding: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingHorizontalMNudge,
    appRegion: "no-drag",
    minHeight: "140px",
  },
  caption: {
    color: tokens.colorNeutralForeground3,
    textAlign: "left",
    marginBottom: tokens.spacingHorizontalM,
    appRegion: "no-drag",
  },
  commandInput: {
    flexGrow: 1,
    minWidth: "0",
    appRegion: "no-drag",
  },
});

interface CustomCommandProps {
  customCommandInput: string;
  onCustomCommandChange: (value: string) => void;
  onCustomCommandClick: () => void;
}

export const CustomCommand: React.FC<CustomCommandProps> = ({
  customCommandInput,
  onCustomCommandChange,
  onCustomCommandClick,
}) => {
  const styles = useStyles();
  const [localInput, setLocalInput] = useState(customCommandInput);

  // Keep local state in sync with props
  useEffect(() => {
    setLocalInput(customCommandInput);
  }, [customCommandInput]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, data: { value: string }) => {
    setLocalInput(data.value);
    onCustomCommandChange(data.value);
  };

  return (
    <Card appearance="subtle" className={styles.card}>
      <CardHeader header={<Body1Strong>Custom Command</Body1Strong>} />
      <caption className={styles.caption}>Send a custom command to get more done!</caption>
      <Input
        className={styles.commandInput}
        value={localInput}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onCustomCommandClick();
          }
        }}
        contentAfter={
          <Button appearance="transparent" icon={<SendRegular />} size="small" onClick={onCustomCommandClick} />
        }
        type="text"
        placeholder="Input an ADB command"
        appearance="filled-darker"
        spellCheck={false}
      />
    </Card>
  );
};
