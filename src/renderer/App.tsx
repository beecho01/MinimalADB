import {
    Button,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    FluentProvider,
    makeStyles,
    type Theme,
    //tokens,
    webDarkTheme,
    webLightTheme,
} from "@fluentui/react-components";
import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Terminal } from "./Terminal";
import { UpdateMessage } from "./UpdateMessage";

const shouldUseDarkColors = (): boolean =>
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

const getTheme = () => (shouldUseDarkColors() ? webDarkTheme : webLightTheme);

const useStyles = makeStyles({
    fluentProvider: {
        height: "calc(100vh - 30.5px)",
        background: "transparent",
    },
    main: {
        height: "calc(100% - 30.5px)",
        display: "flex",
        flexDirection: "row",
        boxSizing: "border-box",
        background: "transparent",
        position: "absolute",
        top: "30.5px",
        left: "0px",
        appRegion: "drag",
        //borderTopWidth: "1px",
        //borderTopColor: tokens.colorNeutralStroke3,
        //borderTopStyle: "solid",
    },
    workspace: {
        height: "100%",
        background: "transparent",
        display: "flex",
        flexGrow: 1,
        flexDirection: "column",
        width: "calc(100vw - 400px)",
        gap: "20px",
        padding: "70px 50px 45px 20px",
        boxSizing: "border-box",
    },
});

export const App = () => {
    const [theme, setTheme] = useState<Theme>(getTheme());
    const styles = useStyles();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        window.ContextBridge.onNativeThemeChanged(() => setTheme(getTheme()));

        const handleAdbError = (_event: unknown, message: unknown): void => {
            if (typeof message === "string") {
                setErrorMessage(message);
                setIsDialogOpen(true);
            } else {
                console.error("Unexpected message type:", message);
            }
        };
        
        window.ContextBridge.on("adb-error", handleAdbError);

        return () => {
            window.ContextBridge.on("adb-error", () => {});
        };
    }, []);

    return (
        <FluentProvider theme={theme} className={styles.fluentProvider}>
            <div></div>
            <div className={styles.main}>
                <Sidebar />
                <div className={styles.workspace}>
                    <Terminal />

                    <Dialog open={isDialogOpen} modalType="alert">
                        <DialogSurface>
                            <DialogBody>
                                <DialogTitle>Device Connection Error</DialogTitle>
                                <DialogContent>
                                    There was an issue communicating with your device: <pre>{errorMessage}</pre>
                                </DialogContent>
                                <DialogActions>
                                    <Button
                                        appearance="secondary"
                                        onClick={() => setIsDialogOpen(false)}
                                    >
                                        Close
                                    </Button>
                                </DialogActions>
                            </DialogBody>
                        </DialogSurface>
                    </Dialog>
                </div>
            </div>
        </FluentProvider>
    );
};
