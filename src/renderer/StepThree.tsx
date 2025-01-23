import { Body1Strong, Button, Card, CardHeader, Input, makeStyles, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
    card: {
        maxWidth: "100%",
        height: "fit-content",
        padding: tokens.spacingHorizontalL,
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
    fileContainer: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalM, // Use gap for consistent spacing
        width: "100%",
        appRegion: "no-drag",
    },
    filePath: {
        flexGrow: 1,
        minWidth: "0",
        appRegion: "no-drag",
    },
    filebutton: {
        flexShrink: 0,
        appRegion: "no-drag",
    },
});

export const StepThree = () => {
    const styles = useStyles();
    return (
        <Card appearance="subtle" className={styles.card}>
            <CardHeader header={<Body1Strong className={styles.header}>Step 3</Body1Strong>} />
            <caption className={styles.caption}>Pick your ROM zip file to install.</caption>
            <div className={styles.fileContainer}>
                <Input
                    className={styles.filePath}
                    type="text"
                    accept=".zip"
                    placeholder="File Path"
                    appearance="filled-darker"
                />
                <Button className={styles.filebutton} appearance="primary">
                    Select
                </Button>
            </div>
        </Card>
    );
};
