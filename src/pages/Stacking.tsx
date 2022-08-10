import React, { useEffect, useState } from "react";
// Material Ui Components
import {
  Typography,
  Box,
  Container,
  Button,
  Checkbox,
  MenuItem,
  Divider,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TextField,
  TableRow,
  InputBase,
  Snackbar,
  Alert,
} from "@mui/material";
import styles from "../style/Stacking/Stacking.module.scss";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import piqtok from "../assets/images/piqsol-token.svg";
import pmb from "../assets/images/pmb.png";
import { makeStyles } from "@mui/styles";
import { useDispatch, useSelector } from "react-redux";
import {
  addStaking,
  getListOfStakingByUserId,
} from "store/reducers/stakingReducer";
import moment from "moment";
import { solToUSD } from "utils/helpers/solToDollarsPrice";
import {
  CHAIN_TITLE,
  extractErrorMessage,
  getConvertedDecimalPrice,
} from "components/common/helpers/helpers";
import {
  stakeUserTokens,
  withdrawUserStakedTokens,
} from "web3/contractHelpers";
import { getUserNFTs } from "store/reducers/userReducer";
import { WalletModal } from "components/walletAdapter";

import {
  setIsOpen,
  setIsSuccess,
  setMessage,
} from "store/reducers/errorSuccessMessageReducer";

const useStyles = makeStyles({
  root: {
    "& .MuiBox-root": {
      background: "var(--bg-card)",
    },
    "& .MuiSelect-select": {
      color: "var(--text-color)",
    },
    "& .MuiSvgIcon-root": {
      color: "var(--text-color)",
    },
  },
});

const DURATIONS = {
  0: {
    duration: 7,
    durationType: "Days",
  },
  1: {
    duration: 30,
    durationType: "Days",
  },
  2: {
    duration: 60,
    durationType: "Days",
  },
  3: {
    duration: 120,
    durationType: "Days",
  },
};

const Time = [
  {
    value: "0",
    label: "7 Days",
  },
  {
    value: "1",
    label: "30 Days",
  },
  {
    value: "2",
    label: "60 Days",
  },
  {
    value: "3",
    label: "120 Days",
  },
];

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 585,
  bgcolor: "#fff",
  boxShadow: 24,
  borderRadius: "15px",
  p: 4,
};

const Staking = () => {
  const dispatch = useDispatch();

  const customStyles = useStyles();

  const currentUser = useSelector(
    (state: any) => state.authReducer.currentUser
  );
  const systemSetting = useSelector(
    (state: any) => state?.systemSettingReducer?.systemSettings
  );

  const userPQLBalance = useSelector(
    (state: any) => state.authReducer.currentPQLBalance
  );
  const [walletModelVisible, setWalletVisible] = useState<boolean>(false);

  const [duration, setDuration] = useState("0");

  const [openTokenStakeModal, setOpenTokenStakeModal] = useState(false);
  const handleOpen1 = () => setOpenTokenStakeModal(true);
  const handleClose1 = () => setOpenTokenStakeModal(false);
  const [openNFTStakeModal, setOpenNFTStakeModal] = useState(false);
  const handleOpen2 = () => setOpenNFTStakeModal(true);
  const handleClose2 = () => setOpenNFTStakeModal(false);
  const [stakingPrice, setStakingPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const [stakeStartingDate, setStakeStartingDate] = useState<string>("");
  const [stakeRedeemDate, setStakeRedeemDate] = useState<string>("");
  const [usdPriceForStakingPrice, setUsdPriceForStakingPrice] =
    useState<number>(0);

  const [userTokenStakings, setUserTokenStakings] = useState<any>([]);
  const [userNftStakings, setUserNftStakings] = useState<any>([]);
  const [nfts, setNfts] = useState<any>([]);
  const [selectedStakingNft, setSelectedStakingNft] = useState<any>([]);

  const [alertMessage, setAlertMessage] = React.useState<any>({
    open: false,
    type: "success",
    message: "",
  });

  const fetchUserPendingTokenStakings = async () => {
    const list = await dispatch(
      getListOfStakingByUserId(currentUser?.id, "token")
    );
    setUserTokenStakings(list);
  };

  const fetchUserPendingNftStakings = async () => {
    const list = await dispatch(
      getListOfStakingByUserId(currentUser?.id, "nft")
    );
    setUserNftStakings(list);
  };

  const fetchUserNfts = async () => {
    const nfts = await dispatch(getUserNFTs());
    setNfts(nfts);
  };

  const formateDates = () => {
    const stakingTime = new Date().getTime();
    const redeemTime = moment(stakingTime).add(
      DURATIONS[duration].duration,
      DURATIONS[duration]?.durationType?.toLowerCase()
    );
    setStakeStartingDate(moment(stakingTime).format("YYYY-MM-DD h:mm"));
    setStakeRedeemDate(moment(redeemTime).format("YYYY-MM-DD h:mm"));
  };

  const conversionStakingPriceToUSD = async () => {
    const usdPrice = await solToUSD(stakingPrice || 0, "solana");
    setUsdPriceForStakingPrice(usdPrice);
  };

  const handleConfirmStake = async () => {
    try {
      if (!currentUser?.id) {
        setWalletVisible(true);
        return;
      }

      setLoading(true);

      if (
        stakingPrice <= 0 ||
        stakingPrice < systemSetting?.minimumStakeLockedAmount
      ) {
        // TODOs  Show Error
        setLoading(false);
        dispatch(
          setMessage(
            "Please provide value grater than Minimum Stake Locked Amount, Please recharge if you've insufficent"
          )
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        return;
      }

      if (userPQLBalance < systemSetting?.minimumStakeLockedAmount) {
        dispatch(
          setMessage("Insufficient balance, please recharge your wallet")
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        return;
      }

      const stakeTokens = await stakeUserTokens(
        stakingPrice,
        parseInt(duration)
      );

      if (stakeTokens === -2) {
        dispatch(
          setMessage(
            "You don't have PQL tokens or there is something went wrong while fetching your balance"
          )
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        return;
      }

      if (stakeTokens === false) {
        dispatch(setMessage("Approval for tax paying is required"));
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        return;
      }

      if (stakeTokens?.status && stakeTokens?.transactionHash) {
        const response = await dispatch(
          addStaking({
            tokenAmount: stakingPrice,
            ...DURATIONS[duration],
            redeemDate: moment(stakeRedeemDate).toISOString(),
            blockchainType: CHAIN_TITLE[currentUser?.chainType],
            stakeType: "token",
          })
        );

        if (!response) {
          // TODO : Show error
          dispatch(
            setMessage("Something went wrong while adding Staking to Database")
          );
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(false));
          return;
        }

        await Promise.all([
          fetchUserPendingTokenStakings(),
          fetchUserNfts(),
          fetchUserPendingNftStakings(),
        ]);
      }
    } catch (err) {
      console.log(
        "🚀 ~ file: Stacking.tsx ~ line 230 ~ handleConfirmStake ~ err",
        err
      );

      dispatch(
        setMessage(
          extractErrorMessage(err) ||
            "Something went wrong while adding Staking to Database"
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));

      return;
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmNftStake = async () => {
    try {
      if (!currentUser?.id) {
        setWalletVisible(true);
        return;
      }

      setLoading(true);
      const response = await dispatch(
        addStaking({
          ...DURATIONS[duration],
          redeemDate: moment(stakeRedeemDate).toISOString(),
          blockchainType: CHAIN_TITLE[currentUser?.chainType],
          nftId: selectedStakingNft?._id,
          stakeType: "nft",
        })
      );

      if (!response) {
        // TODO : Show error
        return;
      }

      await Promise.all([
        fetchUserPendingTokenStakings(),
        fetchUserNfts(),
        fetchUserPendingNftStakings(),
      ]);
    } catch (err) {
      dispatch(
        setMessage(
          "Something went wrong, please try again later" +
            extractErrorMessage(err)
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
      console.log(
        "🚀 ~ file: Stacking.tsx ~ line 206 ~ handleConfirmNftStake ~ err",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  const getBoarderAndBackgroundColor = (stakeStatus: string) => {
    const status = {
      pending: "orange",
      staked: "green",
      earlyStaked: "red",
    };
    return status[stakeStatus];
  };

  useEffect(() => {
    conversionStakingPriceToUSD();
  }, [stakingPrice]);

  useEffect(() => {
    formateDates();
  }, [openTokenStakeModal, duration, openNFTStakeModal]);

  useEffect(() => {
    if (currentUser?.id) {
      Promise.all([
        fetchUserPendingTokenStakings(),
        fetchUserNfts(),
        fetchUserPendingNftStakings(),
      ]);
    }
  }, [currentUser?.id]);

  const handleWithdrawStakedTokens = async (index: number) => {
    try {
      setLoading(true);
      const responseOfWithdrawStakeTokens = await withdrawUserStakedTokens(
        index
      );

      if (
        responseOfWithdrawStakeTokens?.status &&
        responseOfWithdrawStakeTokens?.transactionHash
      ) {
      }
    } catch (err) {
      dispatch(
        setMessage(
          "Something went wrong, please try again later" +
            extractErrorMessage(err)
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Container>
        <Box className={styles.stacking}>
          <Typography component="h3" className={styles.pageTitle}>
            Staking
          </Typography>
          <Box className={styles.stackingCard}>
            <Typography component="h3" className={styles.cardTitle}>
              Piqsol Token
            </Typography>
            <TableContainer className={customStyles.root}>
              <Table
                sx={{ "& .MuiTableCell-root ": { px: 0 }, minWidth: 650 }}
                aria-label="simple table"
                className={styles.tableWrapper}
              >
                <TableHead
                  sx={{ "& .MuiTableCell-root ": { borderBottom: 0 } }}
                >
                  <TableRow>
                    <TableCell className={styles.tableHeadCell}>
                      Items
                    </TableCell>
                    <TableCell className={styles.tableHeadCell}>
                      Duration
                    </TableCell>
                    <TableCell className={styles.tableHeadCell}>
                      Distributed Revenue Share
                    </TableCell>
                    <TableCell className={styles.tableHeadCell}>
                      Minimum Locked Amount
                    </TableCell>
                    <TableCell className={styles.tableHeadCell}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{ borderBottom: "1px solid" }}>
                    <TableCell>
                      <Typography
                        component="div"
                        className={styles.collectionInfoWrapper}
                      >
                        <Typography
                          component="div"
                          className={styles.userInfoWrapper}
                        >
                          <Typography
                            component="div"
                            className={styles.userInfo}
                          >
                            <img
                              src={piqtok}
                              alt="user img"
                              className={styles.userImg}
                            />
                          </Typography>
                          <Typography component="p" className={styles.userName}>
                            PQL
                          </Typography>
                        </Typography>
                      </Typography>
                    </TableCell>
                    <TableCell className={`${styles.tableBodyCell}`}>
                      <Box
                        component="form"
                        sx={{
                          "& .MuiInput-root": {
                            fontFamily: "Visby CF Bold",
                            fontSize: 10,
                          },
                          p: 0.5,
                          pl: 2,
                          border: "1px solid var(--border-color)",
                          borderRadius: "5px",
                          marginRight: "35px",
                        }}
                        noValidate
                        autoComplete="off"
                      >
                        <TextField
                          id="standard-select-supportHelp"
                          select
                          fullWidth
                          value={duration}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setDuration(event.target.value);
                          }}
                          InputProps={{ disableUnderline: true }}
                          variant="standard"
                          className={styles.selectField}
                        >
                          {Time.map((option) => (
                            <MenuItem
                              style={{
                                color: "var(--text-color)",
                                fontFamily: "Visby CF Bold",
                                fontSize: 10,
                              }}
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Box>
                    </TableCell>
                    <TableCell className={styles.tableBodyCell}>
                      <Box className={styles.greenbox}>
                        {`${systemSetting?.stakingPlatformFee || 0}%`}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex" }}>
                        <Typography
                          component="p"
                          className="VisbyBold"
                          sx={{ color: "var(--text-color)", fontSize: "14px" }}
                        >
                          {systemSetting?.minimumStakeLockedAmount || 0}
                        </Typography>
                        <Typography
                          component="p"
                          className="VisbyBold"
                          sx={{
                            opacity: 0.4,
                            ml: 0.5,
                            color: "var(--text-color)",
                            fontSize: "14px",
                          }}
                        >
                          PQL
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell className={styles.tableBodyCell}>
                      <Button className={styles.gradbtn} onClick={handleOpen1}>
                        Stake Now
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Box className={styles.yst} sx={{ my: 3 }}>
              <Typography
                component="p"
                className="VisbyBold"
                sx={{ fontSize: "14px" }}
              >
                Your Staked Tokens
              </Typography>
              <RemoveCircleOutlineIcon sx={{ ml: 1, fontSize: "18px" }} />
            </Box>
            {userTokenStakings?.length > 0 && (
              <Box
                sx={{
                  bgcolor: "var(--stack-card)",
                  p: 2,
                  borderRadius: "0 0 7px 7px",
                }}
              >
                <Typography
                  className={styles.tableBodyCell}
                  sx={{ opacity: 0.4 }}
                  component="p"
                >
                  Staked Tokens
                </Typography>

                {userTokenStakings?.map((stake: any, index: number) => (
                  <TableContainer>
                    <Table
                      sx={{ "& .MuiTableCell-root ": { px: 0 }, minWidth: 650 }}
                      aria-label="simple table"
                      className={styles.tableWrapper}
                    >
                      <TableBody>
                        <TableRow
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell>
                            <Box className={styles.tabtwotxt} sx={{ mr: 1.5 }}>
                              {index + 1}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Box
                                className={styles.tabtwotxt}
                                sx={{ opacity: 0.4, mr: 1 }}
                              >
                                Amount:
                              </Box>
                              <Box
                                className={styles.tabtwotxt}
                              >{`${stake?.tokenAmount} PQL`}</Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Box
                                className={styles.tabtwotxt}
                                sx={{ opacity: 0.4, mr: 1 }}
                              >
                                Duration:
                              </Box>
                              <Box
                                className={styles.tabtwotxt}
                              >{`${stake?.duration} ${stake?.durationType}`}</Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Box
                                className={styles.tabtwotxt}
                                sx={{ opacity: 0.4, mr: 1 }}
                              >
                                Platform Revenue
                              </Box>
                              <Box className={styles.tabtwotxt}>
                                {`${systemSetting?.stakingPlatformFee || 0}%`}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Box
                                className={styles.tabtwotxt}
                                sx={{ opacity: 0.4, mr: 1 }}
                              >
                                Stake Date:
                              </Box>
                              <Box className={styles.tabtwotxt}>
                                {moment(stake?.createdAt).format(
                                  "YYYY-MM-DD h:mm"
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Box
                                className={styles.tabtwotxt}
                                sx={{ opacity: 0.4, mr: 1 }}
                              >
                                Redemption Date:
                              </Box>
                              <Box className={styles.tabtwotxt}>
                                {moment(stake?.redeemDate).format(
                                  "YYYY-MM-DD h:mm"
                                )}
                              </Box>
                            </Box>
                          </TableCell>

                          {stake?.status !== "claim" ? (
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Box
                                  className={styles.tabtwotxt}
                                  sx={{ opacity: 0.4, mr: 1 }}
                                >
                                  Status:
                                </Box>
                                <Typography
                                  component="div"
                                  className={styles.pending}
                                  style={{
                                    borderColor: getBoarderAndBackgroundColor(
                                      stake?.status
                                    ),
                                  }}
                                >
                                  <Typography
                                    component="div"
                                    className={styles.pendingInner}
                                    style={{
                                      backgroundColor:
                                        getBoarderAndBackgroundColor(
                                          stake?.status
                                        ),
                                    }}
                                  ></Typography>
                                </Typography>

                                <Typography
                                  component="span"
                                  sx={{ fontSize: "14px" }}
                                >
                                  {stake?.status}
                                </Typography>
                              </Box>
                            </TableCell>
                          ) : (
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Button
                                  className={styles.gradbtn}
                                  component="span"
                                  sx={{ fontSize: "14px" }}
                                  disabled={loading}
                                  onClick={async () =>
                                    await handleWithdrawStakedTokens(index)
                                  }
                                >
                                  {stake?.status}
                                </Button>
                              </Box>
                            </TableCell>
                          )}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                ))}
              </Box>
            )}
          </Box>

          {nfts?.length > 0 && (
            <Box className={styles.stackingCard} sx={{ mt: 8 }}>
              <Typography component="h3" className={styles.cardTitle}>
                Your NFT
              </Typography>
              <TableContainer className={customStyles.root}>
                <Table
                  sx={{ "& .MuiTableCell-root ": { px: 0 }, minWidth: 650 }}
                  aria-label="simple table"
                  className={styles.tableWrapper}
                >
                  <TableHead
                    sx={{ "& .MuiTableCell-root ": { borderBottom: 0 } }}
                  >
                    <TableRow>
                      <TableCell className={styles.tableHeadCell}>
                        Items
                      </TableCell>
                      <TableCell className={styles.tableHeadCell}>
                        Duration
                      </TableCell>
                      <TableCell className={styles.tableHeadCell}>
                        Distributed Revenue Share
                      </TableCell>
                      <TableCell className={styles.tableHeadCell}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {nfts.map((nft: any) => (
                      <TableRow sx={{ borderBottom: "1px solid" }}>
                        <TableCell>
                          <Typography
                            component="div"
                            className={styles.collectionInfoWrapper}
                          >
                            <Typography
                              component="div"
                              className={styles.userInfoWrapper}
                            >
                              <Typography
                                component="div"
                                className={styles.userInfo}
                              >
                                <img
                                  src={nft?.image}
                                  alt="user img"
                                  className={styles.userImg}
                                />
                              </Typography>
                              <Typography
                                component="p"
                                className={styles.userName}
                              >
                                {nft?.name}
                              </Typography>
                            </Typography>
                          </Typography>
                        </TableCell>
                        <TableCell className={`${styles.tableBodyCell}`}>
                          <Box
                            component="form"
                            sx={{
                              "& .MuiInput-root": {
                                fontFamily: "Visby CF Bold",
                                fontSize: 10,
                              },
                              p: 0.5,
                              pl: 2,
                              border: "1px solid #d3d3d3",
                              borderRadius: "5px",
                              width: "190px",
                              marginRight: "35px",
                            }}
                            noValidate
                            autoComplete="off"
                          >
                            <TextField
                              id="standard-select-supportHelp"
                              select
                              fullWidth
                              value={duration}
                              onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                setDuration(event.target.value);
                              }}
                              InputProps={{ disableUnderline: true }}
                              variant="standard"
                              className={styles.selectField}
                            >
                              {Time.map((option) => (
                                <MenuItem
                                  style={{
                                    color: "var(--text-color)",
                                    fontFamily: "Visby CF Bold",
                                    fontSize: 10,
                                  }}
                                  key={option.value}
                                  value={option.value}
                                  sx={{ color: "var(--text-color)" }}
                                >
                                  {option.label}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Box>
                        </TableCell>
                        <TableCell className={styles.tableBodyCell}>
                          <Box className={styles.greenbox}>{`${
                            systemSetting?.stakingPlatformFee || 0
                          }%`}</Box>
                        </TableCell>
                        <TableCell className={styles.tableBodyCell}>
                          <Button
                            className={styles.gradbtn}
                            onClick={() => {
                              setSelectedStakingNft(nft);
                              handleOpen2();
                            }}
                          >
                            Stake Now
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box className={styles.yst} sx={{ my: 3 }}>
                <Typography component="p" className="VisbyBold">
                  Your Staked NFTs
                </Typography>
                <AddCircleOutlineIcon sx={{ ml: 1 }} />
              </Box>
              {userNftStakings?.length > 0 && (
                <Box
                  sx={{
                    bgcolor: "var(--stack-card)",
                    p: 2,
                    borderRadius: "0 0 7px 7px",
                  }}
                >
                  <Typography
                    className={styles.tableBodyCell}
                    sx={{ opacity: 0.4 }}
                    component="p"
                  >
                    Staked Tokens
                  </Typography>
                  <TableContainer>
                    <Table
                      sx={{ "& .MuiTableCell-root ": { px: 0 }, minWidth: 650 }}
                      aria-label="simple table"
                    >
                      <TableBody>
                        {userNftStakings?.map((stake, index) => (
                          <TableRow
                            sx={{
                              "&:last-child td, &:last-child th": {
                                border: 0,
                                pb: 1,
                              },
                            }}
                          >
                            <TableCell>
                              <Box
                                className={styles.tabtwotxt}
                                sx={{ mr: 1.5 }}
                              >
                                {index + 1}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography
                                component="div"
                                className={styles.collectionInfoWrapper}
                              >
                                <Typography
                                  component="div"
                                  className={styles.userInfoWrapper}
                                >
                                  <Typography
                                    component="div"
                                    className={styles.userInfo}
                                  >
                                    <img
                                      src={stake?.nftId?.image}
                                      alt="user img"
                                      className={styles.userImg}
                                    />
                                  </Typography>
                                  <Typography
                                    component="p"
                                    className={styles.tabnam}
                                  >
                                    {stake?.nftId?.name}
                                  </Typography>
                                </Typography>
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Box
                                  className={styles.tabtwotxt}
                                  sx={{ opacity: 0.4, mr: 1 }}
                                >
                                  Duration:
                                </Box>
                                <Box
                                  className={styles.tabtwotxt}
                                >{`${stake?.duration} ${stake?.durationType}`}</Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Box
                                  className={styles.tabtwotxt}
                                  sx={{ opacity: 0.4, mr: 1 }}
                                >
                                  Platform Revenue
                                </Box>
                                <Box className={styles.tabtwotxt}>{`${
                                  systemSetting?.stakingPlatformFee || 0
                                }%`}</Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Box
                                  className={styles.tabtwotxt}
                                  sx={{ opacity: 0.4, mr: 1 }}
                                >
                                  Stake Date:
                                </Box>
                                <Box className={styles.tabtwotxt}>
                                  {`${moment(stake?.createdAt).format(
                                    "YYYY-MM-DD h:mm"
                                  )}`}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Box
                                  className={styles.tabtwotxt}
                                  sx={{ opacity: 0.4, mr: 1 }}
                                >
                                  Redemption Date:
                                </Box>
                                <Box className={styles.tabtwotxt}>
                                  {`${moment(stake?.redeemDate).format(
                                    "YYYY-MM-DD h:mm"
                                  )}`}
                                </Box>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Container>
      {/* Modal 1 */}
      <Modal
        open={openNFTStakeModal}
        onClose={handleClose2}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className={customStyles.root}
      >
        <Box sx={style}>
          <Box sx={{ position: "relative" }} className={styles.stackmodal}>
            <CloseIcon
              sx={{ position: "absolute", right: 0, top: 0 }}
              onClick={handleClose2}
            />
            <Typography className={styles.modalheading} component="h2">
              Stake your NFT
            </Typography>
            <Box>
              <Typography
                component="p"
                sx={{ mb: 1 }}
                className={styles.modaltext1}
              >
                Stake NFT
              </Typography>
              <Typography
                component="div"
                className={styles.collectionInfoWrapper}
              >
                <Typography component="div" className={styles.userInfoWrapper}>
                  <Typography component="div" className={styles.userInfo}>
                    <img
                      src={selectedStakingNft?.image}
                      alt="user img"
                      className={styles.userImg}
                    />
                  </Typography>
                  <Typography component="p" className={styles.userName}>
                    {selectedStakingNft?.name}
                  </Typography>
                </Typography>
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography
              component="p"
              sx={{ mb: 1 }}
              className={styles.modaltext1}
            >
              Duration
            </Typography>
            <Box
              component="form"
              sx={{
                "& .MuiInput-root": {
                  fontFamily: "Visby CF Bold",
                  fontSize: 14,
                },

                p: 2,
                border: "1px solid #d3d3d3",
                borderRadius: "5px",
              }}
              noValidate
              autoComplete="off"
            >
              <TextField
                id="standard-select-supportHelp"
                select
                fullWidth
                value={duration}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setDuration(event.target.value);
                }}
                InputProps={{ disableUnderline: true }}
                variant="standard"
              >
                {Time.map((option) => (
                  <MenuItem
                    sx={{
                      color: "var(--text-color)",
                      fontFamily: "Visby CF Bold",
                      fontSize: 14,
                    }}
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box
              sx={{
                py: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {" "}
              <Typography component="p" className={styles.modaltext1}>
                Distributed revenue share
              </Typography>
              <Box className={styles.greenbox}>{`${
                systemSetting?.stakingPlatformFee || 0
              }%`}</Box>
            </Box>
            <Divider />
            <Box
              sx={{
                py: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {" "}
              <Typography component="p" className={styles.modaltext1}>
                Stake date
              </Typography>
              <Typography component="p" className={styles.modaltext}>
                {stakeStartingDate}
              </Typography>
            </Box>
            <Divider />
            <Box
              sx={{
                py: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {" "}
              <Typography component="p" className={styles.modaltext1}>
                Redemption date
              </Typography>
              <Typography component="p" className={styles.modaltext}>
                {stakeStartingDate}
              </Typography>
            </Box>
            <Divider />
            <Box
              sx={{
                py: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Checkbox
                defaultChecked
                sx={{
                  pl: 0,
                  color: "#43F195",
                  "&.Mui-checked": {
                    color: "#43F195",
                  },
                }}
              />
              <Typography component="p" className={styles.accept}>
                I have read and I accept the terms and conditions.
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                className={styles.gradbtn}
                onClick={handleConfirmNftStake}
                disabled={loading}
              >
                {!currentUser?.id ? "Login to Stake your NFT" : "Confirm Stake"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      <Modal
        open={openTokenStakeModal}
        onClose={handleClose1}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className={customStyles.root}
      >
        <Box sx={style}>
          <Box sx={{ position: "relative" }} className={styles.stackmodal}>
            <CloseIcon
              sx={{ position: "absolute", right: 0, top: 0 }}
              onClick={handleClose1}
            />
            <Typography className={styles.modalheading} component="h2">
              Stake Piqsol Tokens
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography
                component="p"
                sx={{ mb: 1 }}
                className={styles.modaltext1}
              >
                Amount to stake & lock
              </Typography>
              <Box
                className={styles.sbbox}
                sx={{ p: 2, border: "1px solid #d3d3d3", borderRadius: "11px" }}
              >
                <Box>
                  <InputBase
                    className={styles.price}
                    defaultValue={stakingPrice}
                    placeholder="Token Amount"
                    value={stakingPrice}
                    type="number"
                    onChange={(e) => {
                      if (parseFloat(e.target.value) < 0) {
                        setStakingPrice(0);
                        return;
                      }
                      setStakingPrice(parseFloat(e.target.value));
                    }}
                  />
                  <Typography component="p" className={styles.pricesm}>
                    {getConvertedDecimalPrice(usdPriceForStakingPrice)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex" }}>
                  <Button
                    className={styles.usemax}
                    onClick={() => {
                      if (
                        userPQLBalance < systemSetting?.minimumStakeLockedAmount
                      ) {
                        dispatch(
                          setMessage(
                            "Insufficient balance, please recharge your wallet"
                          )
                        );
                        dispatch(setIsOpen(true));
                        dispatch(setIsSuccess(false));
                        return;
                      }
                      setStakingPrice(
                        parseFloat(
                          getConvertedDecimalPrice(
                            parseFloat(userPQLBalance)
                          ).toString()
                        )
                      );
                    }}
                  >
                    USE MAX
                  </Button>
                  <Button className={styles.pqlbtn} sx={{ ml: 1, gap: 0.5 }}>
                    <img src={pmb} />
                    PQL
                  </Button>
                </Box>
              </Box>
            </Box>
            <Typography
              component="p"
              sx={{ mb: 1 }}
              className={styles.modaltext1}
            >
              Duration
            </Typography>
            <Box
              component="form"
              sx={{
                "& .MuiInput-root": {
                  fontFamily: "Visby CF Bold",
                  fontSize: 14,
                },

                p: 2,
                border: "1px solid #d3d3d3",
                borderRadius: "5px",
              }}
              noValidate
              autoComplete="off"
            >
              <TextField
                id="standard-select-supportHelp"
                select
                fullWidth
                value={duration}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setDuration(event.target.value);
                }}
                InputProps={{ disableUnderline: true }}
                variant="standard"
              >
                {Time.map((option) => (
                  <MenuItem
                    sx={{
                      color: "var(--text-color)",
                      fontFamily: "Visby CF Bold",
                      fontSize: 14,
                    }}
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box className={styles.sbbox} sx={{ py: 3 }}>
              <Typography component="p" className={styles.modaltext1}>
                Distributed revenue share
              </Typography>
              <Box className={styles.greenbox}>
                {`${systemSetting?.stakingPlatformFee || 0}%`}
              </Box>
            </Box>
            <Divider />
            <Box className={styles.sbbox} sx={{ py: 3 }}>
              <Typography component="p" className={styles.modaltext1}>
                Stake date
              </Typography>
              <Typography component="p" className={styles.modaltext}>
                {stakeStartingDate}
              </Typography>
            </Box>
            <Divider />
            <Box className={styles.sbbox} sx={{ py: 3 }}>
              <Typography component="p" className={styles.modaltext1}>
                Redemption date
              </Typography>
              <Typography component="p" className={styles.modaltext}>
                {stakeRedeemDate}
              </Typography>
            </Box>
            <Divider />
            <Box
              sx={{
                py: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Checkbox
                defaultChecked
                sx={{
                  pl: 0,
                  color: "#43F195",
                  "&.Mui-checked": {
                    color: "#43F195",
                  },
                }}
              />
              <Typography component="p" className={styles.accept}>
                I have read and I accept the terms and conditions.
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                className={styles.gradbtn}
                onClick={handleConfirmStake}
                disabled={loading}
              >
                {!currentUser?.id
                  ? "Login to Stake your Token"
                  : "Confirm Stake"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>{" "}
      <WalletModal
        isVisible={walletModelVisible}
        onClose={() => setWalletVisible(false)}
      />
    </>
  );
};

export default Staking;
