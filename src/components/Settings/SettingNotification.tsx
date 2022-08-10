import React, { useEffect, useState } from "react";

import axios from "axios";
// Material Ui Components
import { Typography, Box } from "@mui/material";
import Checkbox, { CheckboxProps } from "@mui/material/Checkbox";
import { styled } from "@mui/material/styles";
import styles from "../../style/Settings/SettingNotification.module.scss";
import { mapingNewSettings } from "utils/helpers/settings";

const BpIcon = styled("span")(({ theme }) => ({
  borderRadius: 5,
  width: 19,
  height: 19,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 0 0 1px rgb(16 22 26 / 40%)"
      : "inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)",
  backgroundColor: "#D8D8D8",
  backgroundImage:
    theme.palette.mode === "dark"
      ? "linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))"
      : "linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))",
  ".Mui-focusVisible &": {
    outline: "2px auto #979797",
    outlineOffset: 2,
  },
  "input:hover ~ &": {
    backgroundColor: "#D8D8D8",
  },
  "input:disabled ~ &": {
    boxShadow: "none",
    background:
      theme.palette.mode === "dark"
        ? "rgba(57,75,89,.5)"
        : "rgba(206,217,224,.5)",
  },
}));

const BpCheckedIcon = styled(BpIcon)({
  backgroundColor: "#3770E3",
  backgroundImage:
    "linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))",
  "&:before": {
    display: "block",
    width: 19,
    height: 19,
    backgroundImage:
      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
      " fillRule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
      "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
    content: '""',
  },
  "input:hover ~ &": {
    backgroundColor: "#3770E3",
  },
});

interface UserNotificationSettings {
  title: string;
  description: string;
  isAllowed: boolean;
}

const defaultSettings: UserNotificationSettings[] = [
  {
    title: "Item Sold",
    description: "When someone purchased one of your items",
    isAllowed: true,
  },
  {
    title: "Bid Activity",
    description: "When someone bids on one of your items",
    isAllowed: true,
  },
  {
    title: "Price Change",
    description: "When an item you made an offer on changes in price",
    isAllowed: true,
  },
  {
    title: "Auction Expiration",
    description: "When a Dutch or English auction you created ends",
    isAllowed: true,
  },
  {
    title: "Outbid",
    description: "When an offer you placed is exceeded by another user",
    isAllowed: true,
  },
  {
    title: "Referral Successful",
    description: "When an item you referred is purchased",
    isAllowed: true,
  },
  {
    title: "Owned Asset Updates",
    description:
      "When a significant update occurs for one of the items you have purchased",
    isAllowed: false,
  },
  {
    title: "Successful Purchase",
    description: "When you successfully buy an item",
    isAllowed: false,
  },
  {
    title: "Piqsol Newsletter",
    description: "Occasional updates from the Piqsol team",
    isAllowed: false,
  },
];

interface BPCheckBoxProps {
  checkBoxProps: CheckboxProps;
  checkedIndex: number;
  setSettings: Function;
  userSettings: UserNotificationSettings[];
  setUserSettings: Function;
}

// Inspired by blueprintjs
function BpCheckbox(props: BPCheckBoxProps) {
  const {
    checkBoxProps,
    userSettings,
    setSettings,
    checkedIndex,
    setUserSettings,
  } = props;
  const { defaultChecked } = checkBoxProps;

  const handleSettingsChange = () => {
    userSettings[checkedIndex].isAllowed = !defaultChecked;
    setUserSettings([...userSettings]);
    setSettings(userSettings);
  };

  return (
    <Checkbox
      sx={{
        "&:hover": { bgcolor: "transparent" },
      }}
      disableRipple
      color="default"
      checkedIcon={<BpCheckedIcon />}
      icon={<BpIcon />}
      inputProps={{ "aria-label": "Checkbox demo" }}
      {...checkBoxProps}
      onChange={handleSettingsChange}
    />
  );
}

function SettingNotification() {
  const [userNotificationSettings, setUserNotificationSettings] = useState<
    UserNotificationSettings[]
  >([]);

  const authToken = localStorage.getItem("authToken") || "";

  const setUserNotifications = async (newSettings: any[]) => {
    try {
      await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + "notificationSetting/setSettings",
        headers: {
          "x-auth-token": authToken,
          "Content-Type": "application/json",
        },
        data: {
          notificationSettings: newSettings,
        },
      });
    } catch (err) {
      console.log("Error in Setting User Notification: ", err);
    }
  };

  const getUserNotifications = async () => {
    try {
      const settingsRes = await axios({
        method: "get",
        url: process.env.REACT_APP_BASE_URL + "notificationSetting/getSettings",
        headers: {
          "x-auth-token": authToken,
          "Content-Type": "application/json",
        },
      });
      const data = settingsRes?.data;
      if (
        data?.settings?.length &&
        data?.settings?.length === defaultSettings?.length
      ) {
        setUserNotificationSettings([...data.settings]);
        return;
      }

      const newSettings = mapingNewSettings(data?.settings, defaultSettings);

      setUserNotificationSettings([...newSettings]);

      if (newSettings?.length) {
        setUserNotifications(newSettings);
      }

      return;
    } catch (err) {
      console.log("Error In Notification Settings: ", err);
    }
  };

  useEffect(() => {
    getUserNotifications();
  }, []);

  return (
    <>
      <Box className={styles.notification}>
        <Box className={styles.profileRightItem}>
          <Typography component="h3" className={styles.pageTitle}>
            Notifications Settings
          </Typography>
          <Typography component="p" className={styles.pageSubTitle}>
            Select which notifications you would like to receive
          </Typography>
          <Box sx={{ mt: 5 }}>
            {userNotificationSettings.map((setting, index) => (
              <Box className={styles.checkboxWrap}>
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <BpCheckbox
                    checkBoxProps={{
                      defaultChecked: setting.isAllowed,
                      sx: {
                        "& .MuiSvgIcon-root": { fontSize: 28 },
                        p: 0,
                        pr: 2,
                      },
                    }}
                    setSettings={setUserNotifications}
                    userSettings={userNotificationSettings}
                    setUserSettings={setUserNotificationSettings}
                    checkedIndex={index}
                  />
                  <Box>
                    <Typography
                      component="p"
                      sx={{ mb: 0.5 }}
                      className={styles.checkboxText}
                    >
                      {setting.title}
                    </Typography>
                    <Typography component="p" className={styles.checkboxTextb}>
                      {setting.description}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default SettingNotification;
