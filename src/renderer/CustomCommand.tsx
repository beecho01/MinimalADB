import { Body1Strong, Button, ButtonProps, Card, CardHeader, Input, makeStyles, tokens } from "@fluentui/react-components";
import { SendRegular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  card: {
      maxWidth: "100%",
      height: "fit-content",
      padding: tokens.spacingHorizontalL,
      marginBottom: tokens.spacingHorizontalMNudge,
      appRegion: "no-drag",
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

const SendButton: React.FC<ButtonProps> = (props) => {
    return (
      <Button
        {...props}
        appearance="transparent"
        icon={<SendRegular />}
        size="small"
      />
    );
  };

export const CustomCommand = () => {
  const styles = useStyles();
  return (
      <Card appearance="subtle" className={styles.card}>
          <CardHeader header={<Body1Strong>Custom Command</Body1Strong>} />
          <caption className={styles.caption}>Send a custom command to get more done!</caption>
              <Input
                  className={styles.commandInput}
                  contentAfter={<SendButton />}
                  type="text"
                  placeholder="adb ..."
                  appearance="filled-darker"
              />
      </Card>
  );
};
