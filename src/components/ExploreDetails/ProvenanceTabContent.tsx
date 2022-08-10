import * as React from "react";

import { Typography, Box, Link } from "@mui/material";
import Classes from "style/Explore/ProvenanceTabContent.module.scss";
import moment from "moment";

export default function ProvenanceTabContent({ nftDetails }: any) {
  return (
    <Box className={Classes.ProvenanceTabContentWrapper}>
      <Typography component="div" className={Classes.item}>
        <Typography component="div">
          <Typography component="div" className={Classes.dateItem}>
            {moment(nftDetails?.createdAt).format("D MMM YYYY")}
          </Typography>
        </Typography>
        <Typography component="div">
          <Typography component="h4" className={Classes.title}>
            NFT + Creation
          </Typography>
          <Typography component="p" className={Classes.description}>
            NFT+ with title {nftDetails?.name} has been created by {nftDetails?.userId.fullName}.
          </Typography>
        </Typography>
        <Typography component="p" className={Classes.time}>
          {moment(nftDetails?.createdAt).format("H:MM")}
        </Typography>
      </Typography>
    </Box>
  );
}
