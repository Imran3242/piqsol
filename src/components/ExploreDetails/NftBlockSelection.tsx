import React from "react";
import { Typography } from "@mui/material";
import Classes from "style/Explore/MetaInfo.module.scss";

const NftBlockSelection = ({ blocksCount }: { blocksCount: any }) => {
  return (
    <>
      <Typography component="div" className={Classes.blockCountInfo}>
        NFT has been created with:
        <Typography
          component="span"
          className={Classes.count}
          style={{ fontWeight: "bold" }}
        >
          {" "}
          {(parseInt(blocksCount) || 0) + " Blocks"}
        </Typography>
      </Typography>
      <Typography component="div" className={Classes.blockAction}>
        <Typography component="div" className={Classes.blockInfo}>
          {"No block selected "}
        </Typography>
        <Typography component="div" className={Classes.clearSelection}>
          Clear Selection
        </Typography>
      </Typography>
    </>
  );
};

export default NftBlockSelection;
