import { Divider, makeStyles, Title1 } from "@fluentui/react-components";
import { CustomCommand } from "./CustomCommand";
import { StepFour } from "./StepFour";
import { StepOne } from "./StepOne";
import { StepThree } from "./StepThree";
import { StepTwo } from "./StepTwo";

const useStyles = makeStyles({
    sidebar: {
        height: "100%",
        width: "400px",
        display: "flex",
        flexDirection: "column",
        //borderRightWidth: "1px",
        //borderRightColor: tokens.colorNeutralStroke3,
        //borderRightStyle: "solid",
        gap: "20px",
        padding: "0px 20px 20px 40px",
        boxSizing: "border-box",
        flexShrink: 0,
    },
    image: {
        marginLeft: "15px",
        width: "32px",
        height: "32px",
        marginBottom: "-4px",
        appRegion: "no-drag",
        opacity: 0.2,
        userSelect: "none",
    },
    title: {
        appRegion: "no-drag",
        userSelect: "none",
    }
});

export const Sidebar = () => {
    const styles = useStyles();
    return (
        <div className={styles.sidebar}>
            <div>
                <Title1 className={styles.title}>MinimalADB</Title1>
                <a href="https://github.com/beecho01/MinimalADB" target="_blank" rel="noopener noreferrer">
                    <img className={styles.image} src="assets/github-mark-white.png" />
                </a>
            </div>
            <StepOne />
            <StepTwo />
            <StepThree />
            <StepFour />
            <Divider />
            <CustomCommand />
        </div>
    );
};
