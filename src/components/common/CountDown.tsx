import React from "react";
import { Typography, Box, Grid } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Classes from "style/Common/CountDown.module.scss";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import Countdown from "react-countdown";

const CountDown = (props: any) => {
  const [showTimer, setShowTimer] = React.useState<boolean>(true);
  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      return null;
    } else {
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "5px",
          }}
        >
          <Typography component="p" className={Classes.timeLeftText}>
            <FontAwesomeIcon icon={faClock} />
            <span>Auction will end in:</span>
          </Typography>
          <Typography component="div" className={Classes.countDownBox}>
            <div>
              <span className={Classes.times}>{days}</span>
              <span className={Classes.text}>Days</span>
            </div>
            <span className={Classes.colun}>:</span>

            <div>
              <span className={Classes.times}>{hours}</span>
              <span className={Classes.text}>Hours</span>
            </div>
            <span className={Classes.colun}>:</span>

            <div>
              <span className={Classes.times}>{minutes}</span>
              <span className={Classes.text}>Mins</span>
            </div>
            <span className={Classes.colun}>:</span>

            <div>
              <span className={Classes.times}>{seconds}</span>
              <span className={Classes.text}>Secs</span>
            </div>
          </Typography>
        </Box>
      );
    }
  };

  return (
    <>
      {showTimer && (
        <Box className={Classes.descriptionWrapper}>
          <Grid xs={12} component="div" className={Classes.actionsWrapper}>
            <Typography component="div" className={Classes.CountDown}>
              <Countdown
                date={props?.date}
                renderer={renderer}
                onComplete={() => setShowTimer(false)}
              />
            </Typography>
          </Grid>
        </Box>
      )}
    </>
  );
};

export default CountDown;
