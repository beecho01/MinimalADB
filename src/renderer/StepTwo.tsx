import { Button, Card, CardHeader, makeStyles, tokens, Body1Strong } from "@fluentui/react-components";

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

export const StepTwo = () => {
    const styles = useStyles();
    return (
        <Card appearance="subtle" className={styles.card}>
            <CardHeader header={<Body1Strong className={styles.header}>Step 2</Body1Strong>} />
            <caption className={styles.caption}>Reboot into recovery mode.</caption>
            <Button appearance="primary">Reboot Recovery</Button>
        </Card>
    );
};
