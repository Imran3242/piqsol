import * as React from "react";
import { Typography, Box, Tab, Tabs } from "@mui/material";

import CardBox from "./CardBox";
import Classes from "style/Explore/TabsWrapper.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { faClock, faFileLines } from "@fortawesome/free-regular-svg-icons";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import OverViewTabContent from "./OverViewTabContent";
import ProofofAuthenticityTabContent from "./ProofofAuthenticityTabContent";
import DocumentTabContent from "./DocumentTabContent";
import ProvenanceTabContent from "./ProvenanceTabContent";

import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  root: {
    "& .MuiTab-root": {
      minHeight: "50px",
      padding: "10",
    },
  },
});

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
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
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const TabsWrapper = ({ nftDetails }: { nftDetails: any }) => {
  const [value, setValue] = React.useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const Styles = useStyles();

  return (
    <CardBox className={Classes.tabsWrapper}>
      <Box sx={{ width: "100%" }} className={`${Styles.root}`}>
        <Box sx={{ padding: "0 10px" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons={true}
              allowScrollButtonsMobile
              aria-label="basic tabs example"
              sx={{
                "& .MuiTabs-scrollButtons": {
                  display: { xs: "flex", sm: "none" },
                },
                "& .MuiTabs-scrollButtons.Mui-disabled": { opacity: "0.4" },
                "& svg": { fill: "var(--text-color)" },
              }}
            >
              <Tab
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: "800",
                  color: "var(--text-color)",
                  padding: "0 7px",
                  fontFamily: "Visby CF Extra Bold",
                }}
                icon={<InfoOutlinedIcon sx={{ fontSize: "18px" }} />}
                iconPosition="start"
                label="Overview"
                {...a11yProps(0)}
              />
              <Tab
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: "800",
                  color: "var(--text-color)",
                  padding: "0 7px",
                  fontFamily: "Visby CF Extra Bold",
                }}
                icon={<FontAwesomeIcon icon={faShieldHalved} />}
                iconPosition="start"
                label="Proof of Authenticity"
                {...a11yProps(1)}
              />
              <Tab
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: "800",
                  color: "var(--text-color)",
                  padding: "0 7px",
                  fontFamily: "Visby CF Extra Bold",
                }}
                icon={<FontAwesomeIcon icon={faFileLines} />}
                iconPosition="start"
                label="Copyrights"
                {...a11yProps(2)}
              />
              <Tab
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: "800",
                  color: "var(--text-color)",
                  padding: "0 7px",
                  fontFamily: "Visby CF Extra Bold",
                }}
                icon={<FontAwesomeIcon icon={faClock} />}
                iconPosition="start"
                label="Provenance"
                {...a11yProps(3)}
              />
            </Tabs>
          </Box>
        </Box>
        <TabPanel value={value} index={0}>
          <OverViewTabContent nftDetails={nftDetails} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <ProofofAuthenticityTabContent nftDetails={nftDetails} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <DocumentTabContent nftDetails={nftDetails} />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <ProvenanceTabContent nftDetails={nftDetails} />
        </TabPanel>
      </Box>
    </CardBox>
  );
};

export default TabsWrapper;
