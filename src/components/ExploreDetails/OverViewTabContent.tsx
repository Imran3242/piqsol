import * as React from "react";

import { Typography, Box } from "@mui/material";
import Classes from "style/Explore/OverViewTabContent.module.scss";
import moment from "moment";
import { useSelector } from "react-redux";

export default function OverViewTabContent({ nftDetails }: any) {
  const systemSettings = useSelector(
    (state: any) => state.systemSettingReducer.systemSettings
  );
  const getOriginalCreator = () => {
    if (nftDetails?.creators?.length) {
      return (
        nftDetails?.userId?.walletAddress?.toLowerCase() ===
        nftDetails?.creators[0]?.address?.toLowerCase()
      ).toString();
    }
    return false;
  };

  return (
    <Box className={Classes.tableWrapper}>
      <Typography component="div" className={Classes.row}>
        <Typography
          component="div"
          className={Classes.item}
          sx={{ opacity: "0.8" }}
        >
          Mint Address
        </Typography>
        <Typography
          component="div"
          className={Classes.item}
          sx={{ opacity: "0.6", wordBreak: "break-all" }}
        >
          {nftDetails?.mint || nftDetails?.contractAddress}
        </Typography>
      </Typography>

      <Typography component="div" className={Classes.row}>
        <Typography
          component="div"
          className={Classes.item}
          sx={{ opacity: "0.8" }}
        >
          Owner
        </Typography>
        <Typography
          component="div"
          className={Classes.item}
          sx={{ opacity: "0.6", wordBreak: "break-all" }}
        >
          {nftDetails?.userId?.walletAddress}
        </Typography>
      </Typography>
      <Typography component="div" className={Classes.row}>
        <Typography
          component="div"
          className={Classes.item}
          sx={{ opacity: "0.8" }}
        >
          Creator
        </Typography>
        <Typography
          component="div"
          className={Classes.item}
          sx={{ opacity: "0.6" }}
        >
          {nftDetails?.creators?.length > 0 && nftDetails?.creators[0]?.address}
        </Typography>
      </Typography>
      <Typography component="div" className={Classes.row}>
        <Typography
          component="div"
          className={Classes.item}
          sx={{ opacity: "0.8" }}
        >
          Original Owner
        </Typography>
        <Typography
          component="div"
          className={Classes.item}
          sx={{ opacity: "0.6" }}
        >
          {getOriginalCreator()?.toString()?.toUpperCase()}
        </Typography>
      </Typography>
      <Typography component="div" className={Classes.row}>
        <Typography
          component="div"
          className={Classes.item}
          sx={{ opacity: "0.8" }}
        >
          Artist Royalties
        </Typography>
        <Typography
          component="div"
          className={Classes.item}
          sx={{ opacity: "0.6" }}
        >
          {Number(nftDetails?.seller_fee_basis_points) / 100}%
        </Typography>
      </Typography>
      <Typography component="div" className={Classes.row}>
        <Typography
          component="div"
          className={Classes.item}
          sx={{ opacity: "0.8" }}
        >
          Transaction Fee
        </Typography>
        <Typography
          component="div"
          className={Classes.item}
          sx={{ opacity: "0.6" }}
        >
          {systemSettings?.mintPiqsolFee} PQL
        </Typography>
      </Typography>
      <Typography component="div" className={Classes.row}>
        <Typography
          component="div"
          className={Classes.item}
          sx={{ opacity: "0.8" }}
        >
          On Auction
        </Typography>
        <Typography
          component="div"
          className={Classes.item}
          sx={{ opacity: "0.6" }}
        >
          {nftDetails?.activeAuction ? "TRUE" : "FALSE"}
        </Typography>
      </Typography>
      <Typography component="div" className={Classes.row}>
        <Typography
          component="div"
          className={Classes.item}
          sx={{ opacity: "0.8" }}
        >
          Creation Date
        </Typography>
        <Typography
          component="div"
          className={Classes.item}
          sx={{ opacity: "0.6" }}
        >
          {moment(nftDetails?.createdAt).format("DD-MM-YYYY")}
        </Typography>
      </Typography>
    </Box>
  );
}
