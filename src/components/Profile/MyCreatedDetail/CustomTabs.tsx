import React from "react";
import { NavLink, useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import Classes from "../../../style/Common/CustomTabs.module.scss";
import { useSelector } from "react-redux";

const CustomTabs = () => {
  const params = useParams();
  const currentUser = useSelector(
    (state: any) => state?.authReducer?.currentUser
  );
  return (
    <Box component="div" className={Classes.customTabsWrapper}>
      <NavLink
        to={`/${params?.userId}/myCreated/detail/${params.id}/items`}
        className={({ isActive }) =>
          isActive
            ? `${Classes.activeClassLink} ${Classes.tabLink}`
            : `${Classes.tabLink}`
        }
      >
        <Typography component="div" className={Classes.tabItem}>
          <FontAwesomeIcon icon={faList} className={Classes.tabIcon} />{" "}
          <Typography component="span" className={Classes.tabName}>
            Items
          </Typography>
        </Typography>
        <span className={Classes.borderBottom}></span>
      </NavLink>
      <NavLink
        to={`/${params?.userId}/myCreated/detail/${params.id}/activity`}
        className={({ isActive }) =>
          isActive
            ? `${Classes.activeClassLink} ${Classes.tabLink}`
            : `${Classes.tabLink}`
        }
      >
        <Typography component="div" className={Classes.tabItem}>
          <FontAwesomeIcon
            icon={faClockRotateLeft}
            className={Classes.tabIcon}
          />{" "}
          <Typography component="span" className={Classes.tabName}>
            Activity
          </Typography>
        </Typography>
        <span className={Classes.borderBottom}></span>
      </NavLink>
    </Box>
  );
};

export default CustomTabs;
