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

export const StepFour = () => {
    const styles = useStyles();
    return (
        <Card appearance="subtle" className={styles.card}>
            <CardHeader header={<Body1Strong className={styles.header}>Step 4</Body1Strong>} />
            <caption className={styles.caption}>Sideload the ROM file to your device.</caption>
            <Button appearance="primary">Flash device</Button>
        </Card>
    );
};
