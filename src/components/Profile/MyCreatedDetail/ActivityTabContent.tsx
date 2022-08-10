import React from "react";
import { Box, Typography } from "@mui/material";
import NoActivity from "../../../assets/images/no-activity.png";
import Classes from "../../../style/Profile/MyCreatedDetail/ActivityTabContent.module.scss";

const ActivityTabContent = () => {
  return (
    <Box sx={{ marginTop: "20px" }}>
      <Typography component="div" className={Classes.noItems}>
        <Typography component="div">
          <Typography
            component="p"
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <img
              loading="lazy"
              src={NoActivity}
              alt="no activity"
              className={Classes.noActivityImg}
            />
          </Typography>
          <Typography component="h6" className={Classes.noActivityText}>
            No Activity yet
          </Typography>
        </Typography>
      </Typography>
    </Box>
  );
};

export default ActivityTabContent;
