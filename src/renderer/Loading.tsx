import { FluentProvider, makeStyles, Spinner, type Theme } from "@fluentui/react-components";
import { useEffect, useState } from "react";
import { getTheme } from "./App";

const [theme, setTheme] = useState<Theme>(getTheme());

const useStyles = makeStyles({
  loadingContainer: {
    height: "calc(100vh - 61px)",
    display: "flex",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
});

useEffect(() => {
  window.ContextBridge.onNativeThemeChanged(() => setTheme(getTheme()));
}, []);

export const Loading = () => {
  const styles = useStyles();
  return (
    <FluentProvider theme={theme} className={styles.loadingContainer}>
      <Spinner size="huge" labelPosition="below" label="Loading Application..." />
    </FluentProvider>
  );
};
