import * as React from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Typography } from "@mui/material";
import CustomSelectStyles from "../../style/Common/CustomSelect.module.scss";
import CardBox from "./CardBox";
import Classes from "style/Explore/PriceHistory.module.scss";
import NoActivity from "components/common/NoActivity";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useDispatch } from "react-redux";
import { getNftPriceHistory } from "store/reducers/activityReducer";
import moment from "moment";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: false,
      text: "Chart.js Line Chart",
    },
  },
};

const PriceHistory = ({ nftDetails }: any) => {
  const dispatch = useDispatch();
  const [selectedTime, setSelectTime] = React.useState("all");
  const [chartData, setCartData] = React.useState<any>();

  const getNftHistory = async (time: any) => {
    if (nftDetails?._id) {
      const nftHistory: any = await dispatch(
        getNftPriceHistory(nftDetails?._id, time)
      );
      const timeLabels = nftHistory.map((history: any) =>
        moment(history.updatedAt).format("MM/DD")
      );
      const priceSet = nftHistory.map((history: any) => history.price);

      setCartData({
        labels: timeLabels,
        datasets: [
          {
            label: "Dataset 1",
            data: priceSet,
            borderColor: "#43F195",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
          },
        ],
      });
    }
  };

  React.useEffect(() => {
    getNftHistory("all");
  }, [nftDetails]);

  const onTimeChange = (event: any) => {
    const timeValue = event.target.value;
    let dateTime: any = "";
    if (timeValue === "7 days") {
      setSelectTime(timeValue);
      dateTime = moment().add(7, "days").toString();
    }
    if (timeValue === "1 month") {
      setSelectTime(timeValue);
      dateTime = moment().add(1, "month").toString();
    }
    if (timeValue === "all") {
      dateTime = "all";
    }

    getNftHistory(dateTime);
  };

  return (
    <CardBox className={`${Classes.priceHistoryWrapper}`}>
      <Typography component="div" className={Classes.topLevelItem}>
        <Typography component="h4" className={Classes.title}>
          Price History
        </Typography>

        <Typography component="div">
          <FormControl sx={{ minWidth: "100%" }}>
            <Select
              value={selectedTime}
              onChange={onTimeChange}
              className={CustomSelectStyles.customSelect}
              displayEmpty
              inputProps={{ "aria-label": "Without label" }}
              IconComponent={() => (
                <KeyboardArrowDownIcon
                  className={CustomSelectStyles.iconDown}
                />
              )}
              sx={{ minWidth: "143px" }}
              MenuProps={{ classes: { paper: "globalDropdown" } }}
            >
              <MenuItem className={CustomSelectStyles.menuItemText} value="all">
                <span style={{ color: "var(--text-color)" }}>All Time</span>
              </MenuItem>
              <MenuItem
                className={CustomSelectStyles.menuItemText}
                value="7 days"
              >
                <span style={{ color: "var(--text-color)" }}>7 Days</span>
              </MenuItem>
              <MenuItem
                className={CustomSelectStyles.menuItemText}
                value="1 month"
              >
                <span style={{ color: "var(--text-color)" }}>1 Month</span>
              </MenuItem>
            </Select>
          </FormControl>
        </Typography>
      </Typography>
      {chartData?.labels?.length > 0 ? (
        <Line height={80} options={options} data={chartData} />
      ) : (
        <NoActivity />
      )}
    </CardBox>
  );
};

export default PriceHistory;
