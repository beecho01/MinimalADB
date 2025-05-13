import {
  Button,
  makeStyles,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  MessageBarTitle,
} from "@fluentui/react-components";
import { DismissRegular } from "@fluentui/react-icons";
import pkg from "../../package.json";

const useStyles = makeStyles({
  messageBar: {
    position: "relative",
    marginTop: "0",
    marginBottom: "0",
    appRegion: "no-drag",
    userSelect: "none",
  },
});

export const UpdateMessage = () => {
  const styles = useStyles();
  return (
    <MessageBar className={styles.messageBar} intent="info" key="info" layout="singleline">
      <MessageBarBody>
        <MessageBarTitle>Update {pkg.version} available</MessageBarTitle>
      </MessageBarBody>
      <MessageBarActions
        containerAction={<Button aria-label="dismiss" appearance="transparent" icon={<DismissRegular />} />}
      >
        <Button>Install</Button>
      </MessageBarActions>
    </MessageBar>
  );
};
