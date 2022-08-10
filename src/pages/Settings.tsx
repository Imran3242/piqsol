import React, { useState } from "react";

// Material Ui Components
import {
  Typography,
  Box,
  Container,
  Grid,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import styles from "../style/Settings/Settings.module.scss";
import SettingNotification from "../components/Settings/SettingNotification";
import AccountSupport from "../components/Settings/AccountSupport";
import ProfileSettingsEditForm from "../components/Settings/ProfileSettingsEditForm";
import Pen from "../assets/icons/pen.png";
import ScrollToTop from "./ScrollToTop";

import { ReactComponent as ProfileUser } from "../assets/icons/SVG/User.svg";
import { ReactComponent as Notifications } from "../assets/icons/SVG/Bell.svg";
import { ReactComponent as AccountSupportIcon } from "../assets/icons/SVG/Support.svg";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

function Settings() {
  const [editProfile, setEditProfile] = useState(false);

  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const editProfileClick = () => {
    setEditProfile(!editProfile);
  };

  return (
    <>
      <ScrollToTop />
      <Container>
        <Box className={styles.settings}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Box className={styles.profileLeftItem}>
                <Typography component="h3" className={styles.sideBarTitle}>
                  SETTINGS
                </Typography>
                <Box
                  sx={{
                    "& .MuiTabs-indicator": { display: "none" },
                    "& .Mui-selected": {
                      backgroundColor: "#3be189",
                      color: "#000 !important",
                      "& .label": {
                        color: "#000 !important",
                      },
                      "& svg": {
                        "& path": {
                          fill: "#000000",
                        },
                      },
                    },
                    "& .label": {
                      color: "var(--text-color)",
                      fontFamily: "Visby CF Bold",
                    },
                  }}
                >
                  <Tabs
                    className={styles.tabstyle}
                    orientation="vertical"
                    variant="scrollable"
                    value={value}
                    onChange={handleChange}
                    aria-label="Vertical tabs example"
                  >
                    <Tab
                      className={styles.profileSideBarButton}
                      iconPosition="start"
                      label={<Typography className="label">Profile</Typography>}
                      icon={<ProfileUser />}
                      {...a11yProps(0)}
                    />
                    <Tab
                      className={styles.profileSideBarButton}
                      label={
                        <Typography className="label">Notifications</Typography>
                      }
                      iconPosition="start"
                      {...a11yProps(1)}
                      icon={<Notifications />}
                    />
                    <Tab
                      className={styles.profileSideBarButton}
                      label={
                        <Typography className="label">
                          Account Support
                        </Typography>
                      }
                      iconPosition="start"
                      {...a11yProps(2)}
                      icon={<AccountSupportIcon />}
                    />
                  </Tabs>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={9} className={styles.profileRightItem}>
              <TabPanel value={value} index={0}>
                <Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography component="h3" className={styles.pageTitle}>
                      Profile Settings
                    </Typography>
                    {!editProfile && (
                      <Button
                        className={styles.editButton}
                        variant="outlined"
                        startIcon={<img src={Pen} alt="Pen Icon" />}
                        onClick={editProfileClick}
                      >
                        Edit
                      </Button>
                    )}
                  </Box>
                  <ProfileSettingsEditForm editProfile={editProfile} />
                </Box>
              </TabPanel>
              <TabPanel value={value} index={1}>
                <SettingNotification />
              </TabPanel>
              <TabPanel value={value} index={2}>
                <AccountSupport />
              </TabPanel>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
}

export default Settings;
