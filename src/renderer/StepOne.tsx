import { Body1Strong, Button, Card, CardHeader, makeStyles, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
    card: {
        maxWidth: "100%",
        height: "fit-content",
        appRegion: "no-drag",
    },
    header: {
        appRegion: "no-drag",
        userSelect: "none",
    },
    caption: {
        color: tokens.colorNeutralForeground3,
        textAlign: "left",
        appRegion: "no-drag",
        userSelect: "none",
    },
});

export const StepOne = () => {
    const styles = useStyles();
    return (
        <Card appearance="subtle" className={styles.card}>
            <CardHeader header={<Body1Strong className={styles.header}>Step 1</Body1Strong>} />
            <caption className={styles.caption}>Confirm your device is connected via ADB.</caption>
            <Button
                onClick={() => {
                    window.electron.send("adb-start-stream", "devices");
                }}
                appearance="primary"
            >
                ADB devices
            </Button>
        </Card>
    );
};
