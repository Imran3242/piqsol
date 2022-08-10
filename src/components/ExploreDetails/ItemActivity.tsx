import React, { useEffect } from "react";

import axios from "axios";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  MenuItem,
  Box,
} from "@mui/material";
import CustomSelectStyles from "../../style/Common/CustomSelect.module.scss";
import Classes from "style/Explore/ItemActivity.module.scss";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { getActivityIcons } from "components/Profile/helpers/helpers";
import moment from "moment";

const FiltersData = [
  { label: "None", value: "none" },
  {
    label: "Minted",
    value: "minted",
  },
  {
    label: "Buy",
    value: "buy",
  },
  { label: "Sell", value: "sell" },
  {
    label: "Create Collection",
    value: "createCollection",
  },
];
interface ItemActivityType {
  itemDetails: any;
}

const ItemActivity = ({ itemDetails }: ItemActivityType) => {
  const [allItems, setAllItems] = React.useState<any>([]);
  const [selectedFilter, setSelectedFilter] = React.useState<string>("none");

  const getItemActivity = async () => {
    const res: any = await axios({
      method: "get",
      url: `${process.env.REACT_APP_BASE_URL}activity/getItemActivity/${
        itemDetails._id
      }/${selectedFilter || "none"}`,
    });
    setAllItems([...res?.data]);
  };

  useEffect(() => {
    if (itemDetails) {
      getItemActivity();
    }
  }, [itemDetails]);

  useEffect(() => {
    if (itemDetails) {
      getItemActivity();
    }
  }, [selectedFilter]);

  const getFromToDetails = (user) => {
    return user?.fullName || user?.walletAddress || "";
  };

  return (
    <>
      <Box className={Classes.ItemActivityWrapper}>
        <Typography component="div" className={Classes.topLevelItem}>
          <Typography component="h4" className={Classes.title}>
            Item Acitivity
          </Typography>

          <Typography component="div">
            <FormControl sx={{ minWidth: "100%" }}>
              <Select
                value={selectedFilter}
                onChange={async (event) => {
                  setSelectedFilter(event?.target?.value);
                }}
                displayEmpty
                inputProps={{ "aria-label": "Without label" }}
                IconComponent={() => (
                  <KeyboardArrowDownIcon
                    className={CustomSelectStyles.iconDown}
                  />
                )}
                className={CustomSelectStyles.customSelect}
                MenuProps={{ classes: { paper: "globalDropdown" } }}
              >
                {FiltersData.map((filter) => (
                  <MenuItem
                    className={CustomSelectStyles.menuItemText}
                    value={filter.value}
                  >
                    <span
                      style={{
                        fontFamily: "Visby CF Bold",
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "var(--text-color)",
                      }}
                    >
                      {filter.label}
                    </span>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Typography>
        </Typography>

        {allItems.length > 0 ? (
          <TableContainer className={Classes.tableWrapper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell
                    className={Classes.tableHeading}
                    sx={{ paddingLeft: "0" }}
                  >
                    Event
                  </TableCell>
                  <TableCell className={Classes.tableHeading}>Price</TableCell>
                  <TableCell className={Classes.tableHeading}>From</TableCell>
                  <TableCell className={Classes.tableHeading}>To</TableCell>
                  <TableCell className={Classes.tableHeading} align="right">
                    Date
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allItems?.map((allItem: any) => (
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell sx={{ paddingLeft: "0" }}>
                      <Typography
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <Typography component="div">
                          <img
                            loading="lazy"
                            src={getActivityIcons(
                              allItem?.type || allItem?.item
                            )}
                            alt="icon"
                            className={Classes.icon}
                          />
                        </Typography>

                        <Typography
                          component="span"
                          sx={{ fontSize: "14px", color: "var(--text-color)" }}
                        >
                          {allItem?.item || allItem?.type}
                        </Typography>
                      </Typography>
                    </TableCell>
                    <TableCell>{allItem?.price || "-"}</TableCell>
                    <TableCell sx={{ color: "#3770E3 !important" }}>
                      {getFromToDetails(
                        allItem?.fromUserId || allItem?.createdBy
                      )}
                    </TableCell>
                    <TableCell sx={{ color: "#3770E3 !important" }}>
                      {getFromToDetails(allItem?.toUserId)}
                    </TableCell>
                    <TableCell align="right">
                      {moment(allItem?.createdAt).fromNow()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography component="h4" className={Classes.activitiesNotFound}>
            No activity found
          </Typography>
        )}
      </Box>
    </>
  );
};

export default ItemActivity;
