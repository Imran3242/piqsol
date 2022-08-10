import * as React from "react";
import CardBox from "./CardBox";
import Classes from "../../style/Explore/VideoMetaInfo.module.scss";
import FractionIcon from "assets/icons/fraction-icon.png";
import metaClasses from "style/Explore/MetaInfo.module.scss";
import { instantSale, claimNFT } from "../ExploreDetails/MetaInfo";

import {
  Typography,
  Grid,
  Box,
  Button,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";

import { solToUSD } from "utils/helpers/solToDollarsPrice";
import InfoIcon from "@mui/icons-material/Info";
import WalletIcon from "../../assets/icons/wallet.png";
import CheckIcon from "@mui/icons-material/Check";
import { useAppDispatch } from "store/store";
import { useSelector } from "react-redux";
import { useWallet } from "@solana/wallet-adapter-react";
import { endpoint } from "../../utils/helpers/getChainNetwork";
import getTimeDuration from "utils/helpers/getTimeDuration";
import moment from "moment";
import { getAuction, getAuctionBids } from "store/reducers/auctionReducer";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { Connection, programs } from "@metaplex/js";
import Countdown from "react-countdown";
import { getBid } from "store/reducers/auctionReducer";
import BuyNowModal from "./BuyNowModal";
import MakeOfferModal from "./MakeOfferModal";
import {
  cancelBidInstraction,
  placeBidInstruction,
  closeAssociatedAccountInstruction,
  reclaimNFTInstruction,
} from "utils/helpers/auctionWithInstructionUtils";
import {
  sendTransactions,
  sendTransactionsSmart,
} from "utils/helpers/auctionTransactionHelper";
import {
  placeBid,
  updateAuction,
  updateBid,
} from "store/reducers/auctionReducer";
import { updateNotification } from "store/reducers/notificatonReducer";
import { Link, useNavigate } from "react-router-dom";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import { emptyPaymentAccountFunc } from "utils/helpers/emptyPaymentAccountTransaction";
import BN from "bn.js";
import { userPaymentAction } from "store/reducers/messageReducer";
import { getUserBalance } from "utils/helpers/getUserBalance";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import {
  CHAIN_CURRENCY,
  CHAIN_LOGOS,
  CHAIN_TITLE,
  extractErrorMessage,
  getConvertedDecimalPrice,
} from "components/common/helpers/helpers";

import {
  setIsOpen,
  setIsSuccess,
  setMessage,
} from "store/reducers/errorSuccessMessageReducer";

const connection: Connection = new Connection(endpoint.url);
const MAX_RETRIES = 24;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function metaplexConfirm(tx: any) {
  let confirmedTx = null;
  for (let tries = 0; tries < MAX_RETRIES; tries++) {
    confirmedTx = await new Connection(
      endpoint.url,
      "finalized"
    ).getTransaction(tx);
    if (confirmedTx) break;
    await sleep(3000);
  }
  if (!confirmedTx) throw new Error("Could not find requested transaction");
}

const VideoMetaInfo = (props: any) => {
  const dispatch = useAppDispatch();
  const wallet: any = useWallet();
  const [auctionEnded, setAuctionEnded] = React.useState<boolean>(false);
  const [auctionState, setAuctionState] = React.useState<number>();
  const [auctionWinnerKey, setAuctionWinnerKey] = React.useState<string>();
  const [auctionOpenState, setAuctionOpenState] = React.useState<any>({});
  const [auctionBids, setAuctionBids] = React.useState<Array<any>>([]);
  const [refundBid, setRefundBid] = React.useState<any>({});
  const systemSetting = useSelector(
    (state: any) => state?.systemSettingReducer?.systemSettings
  );
  const currentUser = useSelector(
    (state: any) => state.authReducer.currentUser
  );
  const [bidAmount, setBidAmount] = React.useState<Number>(0.2);
  const [openMakeOfferModal, setOpenMakeOfferModal] = React.useState(false);
  const [fracntionalAuctionData, setFranctionalAuctionData] =
    React.useState<any>();

  const [buyNftLoader, setBuyNftLoader] = React.useState<boolean>(false);
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const { auctionData } = props;
  const storeKey = new PublicKey(process.env.REACT_APP_METAPLEX_STORE_ID || "");

  const fetchBids = async (auctionD: any) => {
    const auctionBids: any = await dispatch(getAuctionBids(auctionD?._id));
    setAuctionBids(auctionBids);
  };

  const fetchRefundBid = async () => {
    if (history.state.usr && history.state.usr?.bidId) {
      const refundBid = await dispatch(getBid(history.state.usr?.bidId));
      setRefundBid(refundBid);
    }
  };

  const loadAuctionData = async () => {
    let auctionData = props?.selectedFractionDetails?.activeAuction;
    if (history.state.usr) {
      setAuctionOpenState(history.state.usr);
      auctionData = await dispatch(getAuction(history.state.usr.auctionId));
    }

    setFranctionalAuctionData(auctionData);

    if (props?.selectedFractionDetails && auctionData?.auction) {
      const durations = getTimeDuration(
        moment(auctionData?.endDateTime).toDate(),
        new Date()
      );
      if (durations?.seconds <= 0 && auctionData.auctionType !== "fixedPrice") {
        setAuctionEnded(true);
        // props?.onFetchDetails();
      }
      const auctionKey = new PublicKey(auctionData?.auction);
      connection.onAccountChange(auctionKey, async (data) => {
        await sleep(7000);
        props?.onFetchDetails();
      });
      const loadedAuction = await programs.auction.Auction.load(
        connection,
        auctionKey
      );
      setAuctionState(loadedAuction.data.state);
      if (loadedAuction.data?.bidState?.bids.length) {
        const winnerIndex =
          loadedAuction.data?.bidState?.getWinnerIndex(
            wallet?.publicKey?.toBase58()
          ) || 0;
        setAuctionWinnerKey(
          loadedAuction.data?.bidState?.getWinnerAt(winnerIndex) || ""
        );
      }
      fetchBids(auctionData);
      setBidAmount(Number(auctionData?.auctionPrice));
      fetchRefundBid();
    } else {
      setAuctionBids([]);
    }
  };

  const [currentUSDprice, setCurrentUSDPrice] = React.useState<number>(0);

  const getCurrentUSDConversion = async () => {
    const price = await solToUSD(1, auctionData?.blockchainType?.toLowerCase());
    setCurrentUSDPrice(price);
  };

  React.useEffect(() => {
    getCurrentUSDConversion();
  }, []);

  React.useEffect(() => {
    if (props?.selectedFractionDetails) {
      loadAuctionData();
    }
  }, [props?.selectedFractionDetails]);

  const openBuyNowModal = () => {
    setOpen(true);
  };
  const closeBuyNowModal = () => {
    setOpen(false);
  };
  const showMakeOfferModal = () => {
    setOpenMakeOfferModal(true);
  };
  const closeMakeOfferModal = () => {
    setOpenMakeOfferModal(false);
  };

  const CustomMarkIcon = () => {
    return (
      <Typography
        sx={{
          background: "#43F195",
          height: "14px",
          width: "14px",
          borderRadius: "2px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CheckIcon sx={{ fontSize: "13px !important" }} />
      </Typography>
    );
  };

  const CustomUnMarkIcon = () => {
    return (
      <Typography
        sx={{
          height: "14px",
          width: "14px",
          borderRadius: "2px",
          border: "1px solid #979797",
        }}
      ></Typography>
    );
  };

  const reNavigate = async () => {
    navigate(`/explore`);
  };

  const handlerRefundBid = async () => {
    const auctionData = fracntionalAuctionData;

    if (buyNftLoader) return true;
    try {
      setBuyNftLoader(true);
      const bidToCancel = auctionBids.find(
        (bid: any) =>
          bid._id == auctionOpenState.bidId && bid.status === "pending"
      );
      const { instructions: bidCancelInstruction, signers: bidCancelSinger } =
        await cancelBidInstraction({
          connection,
          wallet,
          auction: new PublicKey(auctionData.auction),
          bidderPotToken: new PublicKey(bidToCancel.bidderPotToken),
        });
      const lookup = {
        cancelBid: {
          instructions: bidCancelInstruction,
          signers: bidCancelSinger,
        },
      };

      let signers = [lookup.cancelBid.signers];
      let toRemoveSigners: any = [];
      let instructions = [lookup.cancelBid.instructions].filter((instr, i) => {
        if (instr.length > 0) {
          return true;
        } else {
          toRemoveSigners[i] = true;
          return false;
        }
      });

      let filteredSigners = signers.filter((_, i) => !toRemoveSigners[i]);
      const txs = await sendTransactions(
        connection,
        wallet,
        instructions,
        filteredSigners,
        "single"
      );
      await dispatch(
        updateBid(bidToCancel?._id, {
          status: "refunded",
        })
      );
      dispatch(updateNotification(auctionOpenState._id, { isSeen: true }));
      setBuyNftLoader(false);
      reNavigate();
    } catch (error) {
      console.log("handlerRefundBid error", error);
      dispatch(setMessage("There is something wrong please try again later"));
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));

      setBuyNftLoader(false);
    }
  };

  const reclaimNftHandler = async () => {
    const auctionData = fracntionalAuctionData;

    try {
      setBuyNftLoader(true);
      const auctionManager = new PublicKey(auctionData.auctionManager);
      const data = await programs.metaplex.AuctionManager.load(
        connection,
        auctionManager
      );
      const store = data.data.store;
      const auctionPubkey = new PublicKey(data.data.auction);

      const refundBidInstructions = await placeBidInstruction({
        connection,
        bidderWallet: wallet,
        amount: new BN(0),
        auction: auctionPubkey,
        taxFee: new BN(0),
      });

      if (refundBidInstructions === -1) {
        setBuyNftLoader(false);

        dispatch(
          setMessage(
            "You must have sol and piqsol token in your wallet for this action"
          )
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));

        return;
      }

      const {
        instructions: placebidInstructions,
        signers: placeBidSigners,
        bidderPotToken,
        bidderMeta,
      }: any = refundBidInstructions;

      let {
        instructions: redeemInstructions,
        signers: redeemSigners,
        tokenAccount,
      } = await reclaimNFTInstruction({
        connection,
        bidderWallet: wallet,
        auction: auctionPubkey,
        store: new PublicKey(store),
      });

      const lookup = {
        placeBid: {
          instructions: placebidInstructions,
          signers: placeBidSigners,
        },
        reclaimNft: {
          instructions: redeemInstructions,
          signers: redeemSigners,
        },
      };

      let signers = [lookup.placeBid.signers, lookup.reclaimNft.signers];
      let toRemoveSigners: any = [];
      let instructions = [
        lookup.placeBid.instructions,
        lookup.reclaimNft.instructions,
      ].filter((instr, i) => {
        if (instr.length > 0) {
          return true;
        } else {
          toRemoveSigners[i] = true;
          return false;
        }
      });

      let filteredSigners = signers.filter((_, i) => !toRemoveSigners[i]);

      const transactionIds = await sendTransactions(
        connection,
        wallet,
        instructions,
        filteredSigners,
        "single"
      );

      if (transactionIds?.length) {
        await dispatch(
          updateAuction(auctionData?._id, { ...auctionData, status: "end" })
        );
        navigate("/explore");
      }
    } catch (err) {
      console.log("error reclaiming nft:", err);
      dispatch(
        setMessage(
          "There is something wrong please try again later" +
            extractErrorMessage(err)
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
    } finally {
      setBuyNftLoader(false);
    }
  };

  const claimPrice = async () => {
    const auctionData = fracntionalAuctionData;

    if (buyNftLoader) return true;
    try {
      setBuyNftLoader(true);
      const auctionManagerPDA = await programs.metaplex.AuctionManager.getPDA(
        new PublicKey(auctionData.auction)
      );

      const auctionManagerLoad = await programs.metaplex.AuctionManager.load(
        connection,
        auctionManagerPDA
      );
      const auctionLoaded = await programs.auction.Auction.load(
        connection,
        new PublicKey(auctionData.auction)
      );

      let {
        instructions: emptyPaymentAccountInstructions,
        signers: emptyPaymentAccountSigners,
        wrappedSolAccs,
        ataOwnerDict,
      } = await emptyPaymentAccountFunc({
        connection,
        vault: new PublicKey(auctionData.vaultId),
        wallet,
        tokenMint: new PublicKey(props?.selectedFractionDetails?.mint),
        acceptPaymentAcc: auctionManagerLoad.data.acceptPayment,
        nftMetadata: props?.selectedFractionDetails?.metadata,
        store: new PublicKey(storeKey),
        tokenTracker: auctionData.tokenTracker,
      });

      // @ts-ignore
      const newUniqueList = [...new Set(wrappedSolAccs)];

      let { instructions: closeAccInstruction, signers: closeAccSigner } =
        await closeAssociatedAccountInstruction({
          associatedAcc: new PublicKey(
            ataOwnerDict[wallet.publicKey.toBase58()]
          ),
          wallet: wallet,
        });

      const lookup = {
        emptyAccount: {
          instructions: emptyPaymentAccountInstructions,
          signers: emptyPaymentAccountSigners,
        },
        closeAccount: {
          instructions: closeAccInstruction,
          signers: closeAccSigner,
        },
      };

      let signers = [lookup.emptyAccount.signers, lookup.closeAccount.signers];
      let toRemoveSigners: any = [];
      let instructions = [
        lookup.emptyAccount.instructions,
        lookup.closeAccount.instructions,
      ].filter((instr, i) => {
        if (instr.length > 0) {
          return true;
        } else {
          toRemoveSigners[i] = true;
          return false;
        }
      });

      let filteredSigners = signers.filter((_, i) => !toRemoveSigners[i]);
      await sendTransactions(
        connection,
        wallet,
        instructions,
        filteredSigners,
        "single"
      );

      var cur_price = auctionBids[0]?.price || auctionData?.auctionPrice;
      await dispatch(
        updateAuction(auctionData._id, {
          nftId: props?.selectedFractionDetails?._id,
          userId: currentUser.id,
          price: cur_price,
          status: "end",
        })
      );
      reNavigate();
      setBuyNftLoader(false);
    } catch (error) {
      console.log("claim price error", error);
      dispatch(
        setMessage(
          "There is something wrong please try again later" +
            extractErrorMessage(error)
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));

      setBuyNftLoader(false);
    }
  };

  const checkUserBalance = async (amount, pqlAmount) => {
    const userBalance = await getUserBalance(currentUser?.chainType, wallet);
    const totalPayable: any = Number(amount);
    // const userBalance = await fetchUserBalance();
    if (
      Number(totalPayable) > Number(userBalance.userNativeBalance) ||
      pqlAmount > userBalance.userPiqsolBalance
    ) {
      dispatch(
        setMessage(
          "You don't have enough PiqSol Tokens or SOL, please recharge"
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));

      setBuyNftLoader(false);
      return false;
    }
    return true;
  };

  const buyNftHandler = async () => {
    const auctionData = fracntionalAuctionData;

    const userBalanceAva = await checkUserBalance(
      bidAmount,
      systemSetting.buyNowPiqsolFee
    );

    if (!userBalanceAva) {
      return false;
    }
    try {
      setBuyNftLoader(true);
      const response = await instantSale({
        connection,
        wallet,
        store: storeKey,
        auction: new PublicKey(auctionData.auction),
      });

      if (response === -1) {
        setBuyNftLoader(false);
        dispatch(
          setMessage(
            "You must have sol and piqsol token in your wallet for this action"
          )
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        return;
      }

      await dispatch(
        updateAuction(auctionData._id, {
          status: "claimPrice",
          nftId: props.selectedFractionDetails?._id,
          userId: currentUser.id,
          price: auctionData.auctionPrice,
        })
      );

      dispatch(setMessage("NFT sent to your wallet"));
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(true));

      navigate(`/${currentUser?.id}/myCollected`);
      setBuyNftLoader(false);
    } catch (error) {
      console.log("buyNftHandler error", error);
      dispatch(
        setMessage(
          "There is something wrong please try again later" +
            extractErrorMessage(error)
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));

      setBuyNftLoader(false);
    }
  };

  const onBidAmountChange = (value: number) => {
    setBidAmount(value);
  };

  const makeAnOfferHandler = async () => {
    if (buyNftLoader) return false;
    try {
      setBuyNftLoader(true);

      const userBalanceAva = await checkUserBalance(bidAmount, systemSetting);

      if (!userBalanceAva) {
        return false;
      }

      if (Number(fracntionalAuctionData.auctionPrice) >= bidAmount) {
        dispatch(setMessage("Bid is to low"));
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));

        return setBuyNftLoader(false);
      }

      const biderExitData = auctionBids.find(
        (bid: any) =>
          bid.userId._id === currentUser.id && bid.status === "pending"
      );

      if (auctionBids.length && Number(auctionBids[0]?.price) >= bidAmount) {
        dispatch(setMessage("Bid already exist"));
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));

        return setBuyNftLoader(false);
      }
      if (biderExitData) {
        const { instructions: bidCancelInstruction, signers: bidCancelSinger } =
          await cancelBidInstraction({
            connection,
            wallet,
            auction: new PublicKey(fracntionalAuctionData.auction),
            bidderPotToken: new PublicKey(biderExitData.bidderPotToken),
          });

        const lookup = {
          cancelBid: {
            instructions: bidCancelInstruction,
            signers: bidCancelSinger,
          },
        };

        let signers = [lookup.cancelBid.signers];
        let toRemoveSigners: any = [];
        let instructions = [lookup.cancelBid.instructions].filter(
          (instr, i) => {
            if (instr.length > 0) {
              return true;
            } else {
              toRemoveSigners[i] = true;
              return false;
            }
          }
        );

        let filteredSigners = signers.filter((_, i) => !toRemoveSigners[i]);
        const txs = await sendTransactions(
          connection,
          wallet,
          instructions,
          filteredSigners,
          "single"
        );
        await dispatch(
          updateBid(biderExitData?._id, {
            status: "expired",
          })
        );
      }
      const makeOfferInstructions = await placeBidInstruction({
        connection,
        bidderWallet: wallet,
        amount: new BN(Number(bidAmount) * LAMPORTS_PER_SOL),
        auction: new PublicKey(fracntionalAuctionData.auction),
        taxFee: new BN(Number(systemSetting?.makeAnOfferPiqsolFee)),
      });

      if (makeOfferInstructions === -1) {
        setBuyNftLoader(false);
        dispatch(
          setMessage(
            "You must have sol and piqsol token in your wallet for this action"
          )
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        return;
      }

      const {
        instructions: bidInstructions,
        signers: bidSigners,
        taxInstructions: taxInstructions2,
        taxSigners: taxSigners2,
        bidderMeta,
        bidderPotToken,
      }: any = makeOfferInstructions;
      const lookup = {
        payTax: {
          instructions: taxInstructions2,
          signers: taxSigners2,
        },
        placeBid: {
          instructions: bidInstructions,
          signers: bidSigners,
        },
      };

      let signers = [lookup.payTax.signers, lookup.placeBid.signers];
      let toRemoveSigners: any = [];
      let instructions = [
        lookup.payTax.instructions,
        lookup.placeBid.instructions,
      ].filter((instr, i) => {
        if (instr.length > 0) {
          return true;
        } else {
          toRemoveSigners[i] = true;
          return false;
        }
      });

      let filteredSigners = signers.filter((_, i) => !toRemoveSigners[i]);
      const txs = await sendTransactionsSmart(
        connection,
        wallet,
        instructions,
        filteredSigners,
        "single"
      );

      if (!txs.isAllSuccess) {
        dispatch(setMessage("Something went wrong"));
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        return;
      }
      await dispatch(
        placeBid({
          auctionId: fracntionalAuctionData._id,
          auction: fracntionalAuctionData.auction,
          store: fracntionalAuctionData.storeId,
          price: bidAmount,
          txId: txs.txList[1],
          status: "pending",
          bidderMeta: bidderMeta.toBase58(),
          bidderPotToken: bidderPotToken.toBase58(),
        })
      );

      dispatch(setMessage("You bid has been placed"));
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(true));

      await dispatch(
        userPaymentAction(
          props?.selectedFractionDetails?._id,
          null,
          currentUser.id,
          systemSetting?.makeAnOfferPiqsolFee,
          txs.txList[0],
          "bid"
        )
      );
      closeMakeOfferModal();
      setBuyNftLoader(false);
    } catch (error) {
      console.log("make an offer error", error);
      dispatch(
        setMessage(
          "There is something wrong please try again later" +
            extractErrorMessage(error)
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));

      setBuyNftLoader(false);
    }
  };

  const claimNftHandler = async () => {
    if (buyNftLoader) return true;
    try {
      setBuyNftLoader(true);
      const bidderPotToken = auctionBids[0].bidderPotToken;
      const response = await claimNFT({
        connection,
        wallet,
        auction: new PublicKey(fracntionalAuctionData.auction),
        store: storeKey,
        bidderPotToken: new PublicKey(bidderPotToken),
      });

      if (response === -1) {
        setBuyNftLoader(false);
        dispatch(
          setMessage(
            "You must have sol and piqsol token in your wallet for this action"
          )
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        return;
      }

      await dispatch(
        updateAuction(fracntionalAuctionData._id, {
          status: "claimPrice",
          nftId: props?.selectedFractionDetails?._id,
          userId: currentUser.id,
          price: auctionBids[0].price,
        })
      );
      dispatch(setMessage("NFT sent to your wallet"));
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(true));

      setBuyNftLoader(false);
      reNavigate();
    } catch (error) {
      console.log("claim nft error", error);
      dispatch(
        setMessage(
          "There is something wrong please try again later" +
            extractErrorMessage(error)
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));

      setBuyNftLoader(false);
    }
  };

  const FractionBuyView: React.FC = () => {
    return (
      <>
        <Typography component="div" className={Classes.priceInfoWrapper}>
          <Typography component="div">
            <Typography component="div" className={Classes.mutedText}>
              Total
            </Typography>
            <Typography
              component="div"
              sx={{ fontFamily: "Visby CF Bold" }}
              className={Classes.priceInfo}
            >
              {getConvertedDecimalPrice(props?.auctionData?.perBlockPrice) +
                " " +
                CHAIN_CURRENCY[props?.auctionData?.blockchainType]}
            </Typography>
            <Typography component="div" className={Classes.mutedText}>
              {`$${props?.auctionData?.perBlockUsdPrice}`}
            </Typography>
          </Typography>
          <Typography component="div">
            <Button
              sx={{ fontFamily: "Visby CF Bold" }}
              className={Classes.actionBtn}
            >
              <img
                loading="lazy"
                src={CHAIN_LOGOS[props?.auctionData?.blockchainType]}
                alt="solLogo"
                style={{
                  height: "22px",
                  width: "22px",
                  objectFit: "contain",
                  marginRight: "5px",
                }}
              />
              {CHAIN_TITLE[props?.auctionData?.blockchainType]}
            </Button>
          </Typography>
        </Typography>
        <Typography component="div" className={Classes.actionInfoWrapper}>
          <Typography component="div" className={Classes.actionInfoItem}>
            <Typography component="span" className={Classes.mutedText}>
              Price per block
            </Typography>
            <Typography component="div" className={Classes.actionWrapper}>
              <Typography component="span" className={Classes.counter}>
                {getConvertedDecimalPrice(props?.auctionData?.perBlockPrice) +
                  " " +
                  CHAIN_CURRENCY[props?.auctionData?.blockchainType]}
              </Typography>
            </Typography>
          </Typography>
          <Divider className={Classes.borderColor} />
        </Typography>
        <Typography component="div" className={Classes.actionInfoWrapper}>
          <Typography component="div" className={Classes.actionInfoItem}>
            <Typography component="span" className={Classes.mutedText}>
              Royalty fee
            </Typography>
            <Typography
              component="span"
              sx={{ fontFamily: "Visby CF Bold" }}
              className={Classes.infoItem}
            >
              {Number(props?.nftDetails?.seller_fee_basis_points || 0) / 100}%
            </Typography>
          </Typography>
          <Divider className={Classes.borderColor} />
        </Typography>
        <Typography component="div" className={Classes.actionInfoWrapper}>
          <Typography component="div" className={Classes.actionInfoItem}>
            <Typography component="span" className={Classes.mutedText}>
              Platform fee
            </Typography>
            <Typography
              component="span"
              sx={{ fontFamily: "Visby CF Bold" }}
              className={Classes.infoItem}
            >
              {systemSetting?.buyNowPiqsolFee} {"PQL"}
            </Typography>
          </Typography>
          <Divider className={Classes.borderColor} />
        </Typography>

        <Typography component="div" className={Classes.customAlertWrapper}>
          <InfoIcon fontSize="small" />
          <Typography
            component="p"
            sx={{
              fontSize: "13px",
              fontWeight: "500",
              fontFamily: "Visby CF Bold",
            }}
          >
            {`Please make sure you have enough ${
              CHAIN_CURRENCY[props?.auctionData?.blockchainType?.toLowerCase()]
            } coins in your wallet!`}{" "}
            <br />
            {`1 ${
              CHAIN_CURRENCY[props?.auctionData?.blockchainType]
            } = $${currentUSDprice}`}
          </Typography>
        </Typography>
        <Typography
          component="div"
          className={Classes.totalInfoWrapper}
          style={{ backgroundClip: "grey" }}
        >
          <Typography component="span" className={Classes.totalTitle}>
            {"Total: "}
          </Typography>
          <Typography component="span" className={Classes.totalCounter}>
            {`${getConvertedDecimalPrice(props?.auctionData?.perBlockPrice)} ${
              CHAIN_CURRENCY[props?.auctionData?.blockchainType]
            }`}
          </Typography>
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked
                icon={<CustomUnMarkIcon />}
                checkedIcon={<CustomMarkIcon />}
              />
            }
            label={
              <Box
                component="div"
                fontSize={12}
                className="VisbyDemiBold"
                sx={{
                  color: "var(--text-color)",
                  opacity: "0.67",
                  fontWeight: "600",
                }}
              >
                I have read and accept the terms and conditions
              </Box>
            }
          />
        </FormGroup>
        <Button
          variant="contained"
          className={`gradientButton ${Classes.buynowBtn}`}
          onClick={() => props.openFractionBuyNowModal()}
          startIcon={
            <img
              loading="lazy"
              src={WalletIcon}
              alt="WalletIcon"
              style={{ height: "18px" }}
            />
          }
        >
          Buy Now
          <div className="fill-two"></div>
        </Button>
      </>
    );
  };

  const FractionAuctionView: React.FC = () => {
    const auctionData = fracntionalAuctionData;
    return (
      <>
        <Typography component="div" className={Classes.priceInfoWrapper}>
          <Typography component="div">
            <Typography component="div" className={Classes.mutedText}>
              Previous Purchase Price
            </Typography>
            <Typography
              component="div"
              sx={{ fontFamily: "Visby CF Bold" }}
              className={Classes.priceInfo}
            >
              {props?.selectedFractionDetails?.currentPrice ||
                props?.auctionData.perBlockPrice +
                  " " +
                  CHAIN_CURRENCY[props?.auctionData?.blockchainType]}
            </Typography>
          </Typography>
          <Typography component="div">
            <Button
              sx={{ fontFamily: "Visby CF Bold" }}
              className={Classes.actionBtn}
            >
              <img
                loading="lazy"
                src={CHAIN_LOGOS[props?.auctionData?.blockchainType]}
                alt="solLogo"
                style={{
                  height: "22px",
                  width: "22px",
                  objectFit: "contain",
                  marginRight: "5px",
                }}
              />
              {CHAIN_TITLE[props?.auctionData?.blockchainType]}
            </Button>
          </Typography>
        </Typography>
        <Typography component="div" className={Classes.actionInfoWrapper}>
          <Typography component="div" className={Classes.actionInfoItem}>
            <Typography component="span" className={Classes.mutedText}>
              Price per block
            </Typography>
            <Typography
              component="span"
              sx={{ fontFamily: "Visby CF Bold" }}
              className={Classes.infoItem}
            >
              {`${Number(
                fracntionalAuctionData?.auctionPrice ||
                  props?.auctionData?.perBlockPrice ||
                  0
              )} ${CHAIN_CURRENCY[props?.auctionData?.blockchainType]}`}
            </Typography>
          </Typography>
          <Divider className={Classes.borderColor} />
        </Typography>
        <Typography component="div" className={Classes.actionInfoWrapper}>
          <Typography component="div" className={Classes.actionInfoItem}>
            <Typography component="span" className={Classes.mutedText}>
              Current Owner
            </Typography>
            <Typography
              component="span"
              sx={{ fontFamily: "Visby CF Bold" }}
              className={Classes.infoItem}
            >
              {props?.selectedFractionDetails?.userId?.fullName}
            </Typography>
          </Typography>
          <Divider className={Classes.borderColor} />
        </Typography>
        <Typography component="div" className={Classes.actionInfoWrapper}>
          <Typography component="div" className={Classes.actionInfoItem}>
            <Typography component="span" className={Classes.mutedText}>
              Last Known Wallet it
            </Typography>
            <Typography
              component="span"
              sx={{ fontFamily: "Visby CF Bold" }}
              className={Classes.infoItem}
            >
              {props?.selectedFractionDetails?.userId?.walletAddress}
            </Typography>
          </Typography>
          <Divider className={Classes.borderColor} />
        </Typography>
        <Typography component="div" className={Classes.actionInfoWrapper}>
          <Typography component="div" className={Classes.actionInfoItem}>
            <Typography component="span" className={Classes.mutedText}>
              Date
            </Typography>
            <Typography
              component="span"
              sx={{ fontFamily: "Visby CF Bold" }}
              className={Classes.infoItem}
            >
              {new Date(
                props?.selectedFractionDetails?.updatedAt
              ).toDateString()}
            </Typography>
          </Typography>
          <Divider className={Classes.borderColor} />
        </Typography>
        <Typography component="div" className={Classes.actionInfoWrapper}>
          <Typography component="div" className={Classes.actionInfoItem}>
            <Typography component="span" className={Classes.mutedText}>
              Purchase For
            </Typography>
            <Typography
              component="span"
              sx={{ fontFamily: "Visby CF Bold" }}
              className={Classes.infoItem}
            >
              {`${
                fracntionalAuctionData?.auctionPrice ||
                props?.auctionData?.perBlockPrice ||
                0
              } ${CHAIN_CURRENCY[props?.auctionData?.blockchainType]}`}
            </Typography>
          </Typography>
          <Divider className={Classes.borderColor} />
        </Typography>

        <div>
          {refundBid &&
            auctionData &&
            auctionOpenState &&
            auctionOpenState?.type === "refundBid" &&
            refundBid.status === "pending" && (
              <Grid container spacing={2} className={metaClasses.actionArea}>
                <Grid item xs={12}>
                  <Button
                    disabled={buyNftLoader}
                    onClick={handlerRefundBid}
                    variant="contained"
                    className={`gradientButton ${metaClasses.buynowBtn}`}
                    startIcon={
                      <img
                        loading="lazy"
                        src={WalletIcon}
                        alt="WalletIcon"
                        style={{ height: "18px" }}
                      />
                    }
                  >
                    {buyNftLoader ? "Please wait" : "Refund your bid"}
                    {buyNftLoader && (
                      <CircularProgress
                        style={{ color: "white", marginLeft: 10 }}
                        size={16}
                      />
                    )}
                    <div className="fill-two"></div>
                  </Button>
                </Grid>
              </Grid>
            )}

          {auctionData &&
            !auctionEnded &&
            currentUser?.id !== auctionData?.userId &&
            auctionData.status === "active" && (
              <Grid container spacing={2} className={metaClasses.actionArea}>
                <div
                  style={{
                    width: "100%",
                    height: 100,
                    display: "flex",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                    paddingTop: 20,
                  }}
                >
                  <div style={{ width: "45%" }}>
                    {auctionData?.auctionType === "fixedPrice" ? (
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          className={`gradientButton ${metaClasses.buynowBtn}`}
                          startIcon={
                            <img
                              loading="lazy"
                              src={WalletIcon}
                              alt="WalletIcon"
                              style={{ height: "18px" }}
                            />
                          }
                          onClick={openBuyNowModal}
                        >
                          Buy Now
                          <div className="fill-two"></div>
                        </Button>
                      </Grid>
                    ) : (
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          className={`gradientButton ${metaClasses.buynowBtn}`}
                          startIcon={<LocalOfferOutlinedIcon />}
                          onClick={showMakeOfferModal}
                        >
                          Make Offer
                        </Button>
                      </Grid>
                    )}
                  </div>
                  <div style={{ width: "46%" }}>
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        className={metaClasses.offerBtn}
                        startIcon={<LocalOfferOutlinedIcon />}
                        // onClick={openBuyNowModal}
                      >
                        History
                        <div className="fill-two"></div>
                      </Button>
                    </Grid>
                  </div>
                </div>
              </Grid>
            )}

          {currentUser &&
            auctionData &&
            auctionData.status !== "end" &&
            ((auctionEnded &&
              auctionData?.auctionType === "highestBid" &&
              auctionBids.length > 0) ||
              auctionData.auctionType === "fixedPrice") &&
            currentUser?.id === auctionData?.userId &&
            (auctionState === 2 || auctionData?.status === "claimPrice") && (
              <Grid container spacing={2} className={metaClasses.actionArea}>
                <Grid item xs={12}>
                  <Button
                    // disabled={buyNftLoader}
                    onClick={claimPrice}
                    variant="contained"
                    className={metaClasses.offerBtn}
                    startIcon={<LocalOfferOutlinedIcon />}
                  >
                    {buyNftLoader
                      ? "Please wait"
                      : "Your NFT is Sold. Claim your Funds"}
                    {buyNftLoader && (
                      <CircularProgress
                        style={{ color: "white", marginLeft: 10 }}
                        size={16}
                      />
                    )}
                  </Button>
                  {buyNftLoader && (
                    <Typography
                      sx={{ color: "var(--text-color)" }}
                      className={`warning-msg ${metaClasses.actionMsg}`}
                    >
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="color-red"
                      />{" "}
                      se the window.
                    </Typography>
                  )}
                </Grid>
              </Grid>
            )}

          {currentUser &&
            auctionData &&
            auctionEnded &&
            auctionData?.status !== "end" &&
            auctionData?.bids?.length === 0 &&
            auctionData?.auctionType === "highestBid" &&
            currentUser?.id === auctionData?.userId && (
              <Grid container spacing={2} className={metaClasses.actionArea}>
                <Grid item xs={12}>
                  <Button
                    onClick={reclaimNftHandler}
                    variant="contained"
                    className={metaClasses.offerBtn}
                    startIcon={<LocalOfferOutlinedIcon />}
                  >
                    {buyNftLoader ? "Please wait" : "Reclaim NFT"}
                    {buyNftLoader && (
                      <CircularProgress
                        style={{ color: "white", marginLeft: 10 }}
                        size={16}
                      />
                    )}
                  </Button>
                  {buyNftLoader && (
                    <Typography
                      sx={{ color: "var(--text-color)" }}
                      className={`warning-msg ${metaClasses.actionMsg}`}
                    >
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="color-red"
                      />{" "}
                      Don't close the window.
                    </Typography>
                  )}
                </Grid>
              </Grid>
            )}

          {currentUser &&
            auctionData &&
            auctionEnded &&
            auctionData.status !== "end" &&
            (auctionState === 1 || auctionData.status === "claimNft") &&
            wallet?.publicKey?.toBase58() === auctionWinnerKey && (
              <Grid container spacing={2} className={metaClasses.actionArea}>
                <Grid item xs={12}>
                  <Button
                    // disabled={buyNftLoader}
                    onClick={claimNftHandler}
                    variant="contained"
                    className={metaClasses.offerBtn}
                    startIcon={<LocalOfferOutlinedIcon />}
                  >
                    {buyNftLoader ? "Please wait" : "Claim NFT"}
                    {buyNftLoader && (
                      <CircularProgress
                        style={{ color: "white", marginLeft: 10 }}
                        size={16}
                      />
                    )}
                  </Button>
                </Grid>
              </Grid>
            )}

          {props?.selectedFractionDetails &&
            currentUser &&
            props?.selectedFractionDetails?.userId?._id === currentUser?.id &&
            !auctionData && (
              <Grid container spacing={2} className={metaClasses.actionArea}>
                <Grid item xs={12}>
                  <Link
                    to={`/listItemForSale/${props?.selectedFractionDetails?._id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Button
                      variant="contained"
                      className={metaClasses.offerBtn}
                    >
                      List To Sell
                    </Button>
                  </Link>
                </Grid>
              </Grid>
            )}
        </div>
      </>
    );
  };

  return (
    <CardBox className={Classes.videoMetaInfoWrapper}>
      {fracntionalAuctionData?.auctionType !== "highestBid" &&
        fracntionalAuctionData?.status === "active" && (
          <Countdown
            date={new Date(props.selectedFractionDetails?.endDateTime)}
            onComplete={() => setAuctionEnded(true)}
            renderer={() => <></>}
          />
        )}
      {props?.selectedFractionDetails && fracntionalAuctionData && (
        <BuyNowModal
          userPQLbalance={props?.userPQLBalance}
          openModal={open}
          closeModal={closeBuyNowModal}
          buyNftHandler={buyNftHandler}
          auctionData={fracntionalAuctionData}
          nftData={props?.selectedFractionDetails}
          buyNftLoader={buyNftLoader}
          connection={connection}
          wallet={wallet}
        />
      )}
      <MakeOfferModal
        userPQLbalance={props?.userPQLBalance}
        buyNftLoader={buyNftLoader}
        openModal={openMakeOfferModal}
        auctionData={fracntionalAuctionData}
        closeModal={closeMakeOfferModal}
        bidAmount={bidAmount}
        onBidAmountChange={onBidAmountChange}
        makeAnOfferHandler={makeAnOfferHandler}
      />
      <Typography component="div" className={Classes.titleWrapper}>
        <Typography component="div" className={Classes.titleInfo}>
          <Typography component="span" className={Classes.iconInfo}>
            <img
              loading="lazy"
              src={FractionIcon}
              alt="farction icon"
              className={Classes.imgIcon}
            />
          </Typography>
          <Typography component="h4" className={Classes.titleName}>
            Fractional NFT Mode
          </Typography>
        </Typography>
        <Typography component="h4" className={Classes.titleBottomInfo}>
          <Typography component="span" className={Classes.titleBottomInfoName}>
            Selected Number of blocks:
          </Typography>
          <Typography
            component="span"
            sx={{ fontFamily: "Visby CF Bold" }}
            className={Classes.shareInfo}
          >
            {" 1/" + Math.ceil(props?.auctionData?.noOfFractions) + " Shares"}
          </Typography>
        </Typography>
        <div style={{ width: "100%", display: "flex" }}>
          <div
            style={{
              width: "50%",
              height: "100%",
              alignItems: "center",
              display: "flex",
            }}
          >
            <Typography component="h4" className={Classes.titleBottomInfo}>
              <Typography
                component="span"
                className={Classes.titleBottomInfoName}
              >
                Fractional Block Number:
              </Typography>
              <Typography
                component="span"
                sx={{ fontFamily: "Visby CF Bold" }}
                className={Classes.shareInfo}
              >
                {" " + (props?.selectedFraction.index + 1)}
              </Typography>
            </Typography>
          </div>
          <div
            style={{
              width: "50%",
              height: "100%",
              justifyContent: "flex-end",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography component="div" className={Classes.blockAction}>
              <Typography component="div">
                <Button
                  type="button"
                  sx={{ textDecoration: "underline" }}
                  onClick={props?.onClearSelection}
                >
                  Clear Selection
                </Button>
              </Typography>
            </Typography>
          </div>
        </div>
      </Typography>
      {!props?.selectedFractionDetails ? (
        <FractionBuyView />
      ) : props?.selectedFractionDetails ? (
        <FractionAuctionView />
      ) : null}
    </CardBox>
  );
};

export default VideoMetaInfo;
