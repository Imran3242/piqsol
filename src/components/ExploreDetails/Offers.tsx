import * as React from "react";
// Material Ui Components
import { Typography } from "@mui/material";

import CardBox from "./CardBox";
import Classes from "style/Explore/Offers.module.scss";
import { solToUSD } from "../../utils/helpers/solToDollarsPrice";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { CHAIN_CURRENCY } from "components/common/helpers/helpers";

const Offers = ({
  auctionBids,
  auctionData,
}: {
  auctionBids: Array<any>;
  auctionData: any;
}) => {
  return (
    <CardBox className={Classes.offersBlockWrapper}>
      <Typography component="h4" className={Classes.title}>
        Offers
      </Typography>

      <TableContainer className={Classes.tableWrapper}>
        <Table
          sx={{ minWidth: 650, tableLayout: "fixed" }}
          aria-label="simple table"
        >
          <TableHead>
            <TableRow>
              <TableCell
                className={Classes.tableHeading}
                sx={{ paddingLeft: "0" }}
              >
                Price
              </TableCell>
              <TableCell className={Classes.tableHeading}>USD Price</TableCell>
              <TableCell className={Classes.tableHeading}>Status</TableCell>

              <TableCell
                className={Classes.tableHeading}
                align="right"
                sx={{ paddingRight: "0" }}
              >
                From
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auctionBids?.map((bid) => (
              <TableRow>
                <TableCell sx={{ paddingLeft: "0" }}>
                  {`${bid?.price} ${
                    CHAIN_CURRENCY[auctionData?.blockchainType?.toLowerCase()]
                  }`}
                </TableCell>
                <TableCell>${bid?.usdPrice?.toFixed(2)}</TableCell>
                <TableCell>
                  <Typography sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      component="div"
                      className={Classes.pending}
                      style={{
                        borderColor:
                          bid?.status === "expired" ? "red" : "#FBD04B",
                      }}
                    >
                      <Typography
                        component="div"
                        className={Classes.pendingInner}
                        style={{
                          backgroundColor:
                            bid?.status === "expired" ? "red" : "#FBD04B",
                        }}
                      ></Typography>
                    </Typography>

                    <Typography component="span" sx={{ fontSize: "14px" }}>
                      {bid?.status}
                    </Typography>
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    color: "#3770E3 !important",
                    wordBreak: "break-all",
                    paddingRight: "0",
                  }}
                  align="right"
                >
                  {bid?.userId?.fullName ||
                    bid?.userId?.name ||
                    bid?.userId?.walletAddress}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </CardBox>
  );
};

export default Offers;
