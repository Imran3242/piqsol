import React from "react";
import { Box, Typography } from "@mui/material";
import NoActivityIcon from "../../assets/images/no-activity.png";
import NoActivityWhiteIcon from "../../assets/images/no-activity-white.png";
import Classes from "../../style/Common/NoActivity.module.scss";
import { useSelector } from "react-redux";

const NoActivity = () => {
  const appTheme = useSelector((state: any) => state?.authReducer?.appTheme);

  return (
    <Box sx={{ marginTop: "20px" }}>
      <Typography component="div" className={Classes.noItems}>
        <Typography component="div">
          <Typography
            component="p"
            sx={{ display: "flex", justifyContent: "center" }}
          >
            {appTheme == "light-theme" ? (
              <img
                loading="lazy"
                src={NoActivityIcon}
                alt="no activity"
                className={Classes.noActivityImg}
              />
            ) : (
              <img
                loading="lazy"
                src={NoActivityWhiteIcon}
                alt="No Activity White Icon"
                className={Classes.noActivityImg}
              />
            )}
          </Typography>
          <Typography
            component="h6"
            className={`VisbyBold ${Classes.noActivityText}`}
          >
            No Data yet
          </Typography>
        </Typography>
      </Typography>
    </Box>
  );
};

export default NoActivity;
