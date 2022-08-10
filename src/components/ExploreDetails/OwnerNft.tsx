import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import Classes from "../../style/Explore/OwnerNft.module.scss";
import WalletLogo from "../../assets/images/wallet-logo.png";
import { useDispatch } from "react-redux";
import { getNftOwnersList } from "store/reducers/activityReducer";
import {
  CHAIN_CURRENCY,
  getConvertedDecimalPrice,
} from "components/common/helpers/helpers";

const OwnerNft = ({ nftDetails }: any) => {
  const [nftOwners, setNftOwners] = React.useState<any>();

  const dispatch = useDispatch();

  const fetchOwnersOfNft = async () => {
    if (nftDetails?._id) {
      const ownersOfNft: any = await dispatch(
        getNftOwnersList(nftDetails?._id)
      );
      setNftOwners(ownersOfNft);
    }
  };
  const calculatevalue = (pricePerBlock, quantity) => {
    if (quantity > 0) {
      let value = pricePerBlock * quantity;
      return value;
    } else {
      return pricePerBlock;
    }
  };
  useEffect(() => {
    fetchOwnersOfNft();
  }, [nftDetails]);
  return (
    <Box className={Classes.OwnerNftWrapper}>
      <Typography component="h4" className={Classes.title}>
        Top 10 Owners of this NFT
      </Typography>

      <TableContainer className={Classes.tableWrapper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell className={Classes.tableHeadCell}>Rank</TableCell>
              <TableCell className={Classes.tableHeadCell}>
                Wallet Address
              </TableCell>
              {nftOwners?.data?.[0]?.nftId?.nftType == "Fraction" && (
                <>
                  <TableCell className={Classes.tableHeadCell}>
                    Price Per Block
                  </TableCell>
                  <TableCell className={Classes.tableHeadCell}>
                    Quantity
                  </TableCell>
                  <TableCell className={Classes.tableHeadCell}>
                    Percentage
                  </TableCell>
                </>
              )}
              <TableCell
                align="right"
                sx={{ paddingRight: "0" }}
                className={Classes.tableHeadCell}
              >
                Value
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {nftOwners?.data?.map((owner: any, index: any) => (
              <TableRow>
                <TableCell className={Classes.tableBodyCell}>
                  {index + 1}
                </TableCell>
                <TableCell className={Classes.tableBodyCell}>
                  <Typography
                    component="div"
                    className={Classes.walletAddressInfo}
                  >
                    <Typography>
                      <img
                        loading="lazy"
                        src={WalletLogo}
                        className={Classes.walletAddressLogo}
                        alt="user img"
                      />
                    </Typography>
                    <Typography
                      component="div"
                      className={Classes.walletAddressInfo}
                    >
                      {owner?.toUserId?.walletAddress}
                    </Typography>
                  </Typography>
                </TableCell>
                {nftOwners?.data?.[0]?.nftId?.nftType == "Fraction" && (
                  <>
                    <TableCell className={Classes.tableBodyCell}>
                      {`${
                        owner?.price
                      } ${nftDetails?.blockchainType?.toLowerCase()}`}
                    </TableCell>
                    <TableCell className={Classes.tableBodyCell}>{`${
                      nftOwners?.quantityOfBlocks[index]
                    } ${
                      nftOwners?.quantityOfBlocks[index] > 1
                        ? "Blocks"
                        : "Block"
                    }`}</TableCell>
                    <TableCell className={Classes.tableBodyCell}>
                      <Typography
                        component="div"
                        className={Classes.progressWrapper}
                      >
                        <LinearProgress
                          className={Classes.progressBar}
                          variant="determinate"
                          value={33.506}
                        />
                        <span
                          className={Classes.progressTooltip}
                          style={{ left: `${33.506}%` }}
                        >
                          {(nftOwners?.quantityOfBlocks[index] /
                            nftOwners?.masterNft?.activeAuction
                              ?.noOfFractions) *
                            100}
                          %
                        </span>
                      </Typography>
                    </TableCell>
                  </>
                )}
                <TableCell
                  align="right"
                  sx={{ paddingRight: "0" }}
                  className={Classes.tableBodyCell}
                >
                  {calculatevalue(
                    owner?.price,
                    nftOwners?.quantityOfBlocks[index]
                  )}{" "}
                  {CHAIN_CURRENCY[nftDetails?.blockchainType?.toLowerCase()]}{" "}
                  <br />
                  {`$${getConvertedDecimalPrice(owner?.usdPrice)}`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OwnerNft;
