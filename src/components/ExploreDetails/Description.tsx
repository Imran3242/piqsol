// Material Ui Components
import React, { useCallback } from "react";
import { Typography, Box, Button, Grid } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Classes from "style/Explore/Description.module.scss";
import { WalletModal } from "../walletAdapter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import { useSelector, useDispatch } from "react-redux";
import DiscordIcon from "../../assets/icons/discord-purple.png";
import {
  authSelector,
  setCurrentPQLBalance,
} from "../../store/reducers/authReducer";

import moment from "moment";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import {
  userPaymentAction,
  getChatPrice,
  getChatUsers,
  setUserPayment,
} from "store/reducers/messageReducer";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { endpoint } from "../../utils/helpers/getChainNetwork";
import { payChatPayment } from "utils/helpers/customTokenAuctionUtils";
import { sendTransactionsSmart } from "utils/helpers/auctionTransactionHelper";
import {
  CHAIN_LOGOS,
  CHAIN_TITLE,
  extractErrorMessage,
  getFormatedDayRemaining,
} from "components/common/helpers/helpers";

import { getUserBalance } from "utils/helpers/getUserBalance";
import { payingTaxForChatForMultichain } from "web3/contractHelpers";

import {
  setIsOpen,
  setIsSuccess,
  setMessage,
} from "store/reducers/errorSuccessMessageReducer";
import { Connection } from "@metaplex/js";

const Description = (props: { nftDetails: any; auctionData: any }) => {
  const { nftDetails, auctionData } = props;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wallet = useWallet();
  const [visible, setVisible] = React.useState<boolean>(false);
  const [remaingDays, setRemaingDays] = React.useState<any>({
    isChatAvailable: false,
    formatedText: "",
  });
  const [chatPrice, setChatPrice] = React.useState<any>();

  const userPayment = useSelector(
    (state: any) => state?.messageReducer?.userPayment
  );
  const systemSetting = useSelector(
    (state: any) => state?.systemSettingReducer?.systemSettings
  );
  const currentUser = useSelector(
    (state: any) => state.authReducer.currentUser
  );

  const chatPricing = async () => {
    const price = await dispatch(getChatPrice("chatPrice"));
    setChatPrice(price);
  };

  const checkForUserPaidTax = async () => {
    await dispatch(setUserPayment({}));
    const result: any = await dispatch(
      getChatUsers(nftDetails?.userId?._id, nftDetails?._id)
    );

    if (result?.length) {
      const { toDate, fromDate } = result[0];
      await dispatch(setUserPayment({ toDate, fromDate }));
    }
  };

  React.useEffect(() => {
    checkForUserPaidTax();
  }, [nftDetails?._id]);

  React.useEffect(() => {
    chatPricing();
  }, []);
  React.useEffect(() => {
    if (userPayment?.toDate && userPayment?.fromDate) {
      const daysInHours = moment(userPayment?.toDate).diff(moment(), "hours");
      setRemaingDays({
        isChatAvailable: daysInHours > 0,
        formatedText: getFormatedDayRemaining(daysInHours),
      });
    }
  }, [userPayment]);
  const states = useSelector(authSelector).authReducer;

  const connection = new Connection(endpoint.url);
  const { publicKey, sendTransaction } = useWallet();

  const onClick = useCallback(async () => {
    if (
      currentUser?.chainType?.toLowerCase() !==
      nftDetails?.blockchainType?.toLowerCase()
    ) {
      dispatch(
        setMessage(
          `You're on wrong chain please switch your chain to ${
            CHAIN_TITLE[auctionData?.blockchainType?.toLowerCase()]
          }`
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
      return;
    }

    if (currentUser?.chainType?.toLowerCase() !== "solana") {
      try {
        const responseForChatTaxPaying = await payingTaxForChatForMultichain(
          systemSetting?.chatFee || 0
        );

        if (
          responseForChatTaxPaying?.status &&
          responseForChatTaxPaying?.transactionHash
        ) {
          await dispatch(
            userPaymentAction(
              nftDetails?._id,
              nftDetails?.userId?._id,
              currentUser?.id,
              systemSetting?.chatFee,
              responseForChatTaxPaying?.transactionHash,
              "chat"
            )
          );
          navigate("/messenger");
          return;
        }

        dispatch(
          setMessage("Something went wrong while paying tax for message")
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        return;
      } catch (err) {
        console.log(
          "🚀 ~ file: Description.tsx ~ line 166 ~ onClick ~ err",
          err
        );
        dispatch(
          setMessage(
            "Something went wrong while paying tax for message" +
              extractErrorMessage(err)
          )
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        return false;
      }
    }

    if (!publicKey) throw new WalletNotConnectedError();
    const { instructions: taxInstructions2, signers: taxSigners2 } =
      await payChatPayment({
        connection,
        wallet,
        transactionAmount: systemSetting?.chatFee,
      });
    const lookup = {
      payTax: {
        instructions: taxInstructions2,
        signers: taxSigners2,
      },
    };

    let signers = [lookup.payTax.signers];
    let toRemoveSigners: any = [];
    let instructions = [lookup.payTax.instructions].filter((instr, i) => {
      if (instr.length > 0) {
        return true;
      } else {
        toRemoveSigners[i] = true;
        return false;
      }
    });

    let filteredSigners = signers.filter((_, i) => !toRemoveSigners[i]);
    const { isAllSuccess, txList }: any = await sendTransactionsSmart(
      connection,
      wallet,
      instructions,
      filteredSigners,
      "single"
    );

    if (!isAllSuccess) {
      dispatch(setMessage("Something went wrong while paying tax for message"));
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
      return;
    }

    setTimeout(async () => {
      const { userPiqsolBalance: balance } = await getUserBalance(
        currentUser?.chainType,
        wallet
      );
      dispatch(setCurrentPQLBalance(balance));
    }, 20000);

    await dispatch(
      userPaymentAction(
        nftDetails?._id,
        nftDetails?.userId?._id,
        currentUser?.id,
        systemSetting?.chatFee,
        txList[0],
        "chat"
      )
    );
  }, [publicKey, sendTransaction, connection, chatPrice?.price]);

  return (
    <Box className={Classes.descriptionWrapper}>
      <Typography component="h4" className={Classes.title}>
        DESCRIPTION
        <Tooltip title="Please note that  at present you can only purchase 1 block of an NFT at a time. The good news is that in mid May 2022, you will be able to select multiple blocks at once for purchasing of your fractional NFTS.">
          <IconButton>
            <HelpOutlineIcon sx={{ fontSize: "20px" }} />
          </IconButton>
        </Tooltip>
      </Typography>
      <Typography component="p" className={Classes.description}>
        {nftDetails?.description}
      </Typography>
      <Grid xs={12} component="div" className={Classes.actionsWrapper}>
        <Button className={`${Classes.grayBtn} ${Classes.actionBtn}`}>
          Minted On:&nbsp;
          <span style={{ fontFamily: "Visby CF Bold" }}>
            {CHAIN_TITLE[nftDetails?.blockchainType]}
          </span>
          <img
            src={CHAIN_LOGOS[nftDetails?.blockchainType]}
            className={Classes.btnLogo}
            alt="cardbadge"
          />
        </Button>
        <a href="https://discord.com/invite/piqsol">
          <Button
            startIcon={
              <img
                loading="lazy"
                src={DiscordIcon}
                alt="DiscordIcon"
                style={{
                  height: "20px",
                  width: "20px",
                  objectFit: "contain",
                  maxHeight: "20px",
                }}
              />
            }
            className={`${Classes.purpleBtn} ${Classes.actionBtn}`}
          >
            <span style={{ fontFamily: "Visby CF Bold", fontSize: "14px" }}>
              Join community
            </span>
          </Button>
        </a>
        <Button
          startIcon={<FontAwesomeIcon icon={faYoutube} />}
          className={`${Classes.redBtn} ${Classes.actionBtn}`}
        >
          <span style={{ fontFamily: "Visby CF Bold", fontSize: "14px" }}>
            Youtube
          </span>
        </Button>

        {nftDetails?.userId?._id != currentUser?.id && states?.isAuth ? (
          remaingDays.isChatAvailable ? (
            <Link
              to={`/messenger`}
              style={{ textDecoration: "none", width: "100%" }}
            >
              <Button className={`${Classes.greenBtn} ${Classes.actionBtn}`}>
                <Typography
                  sx={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <ChatOutlinedIcon />{" "}
                  <span
                    style={{ fontFamily: "Visby CF Bold", fontSize: "15px" }}
                  >
                    Chat with this NFT owner
                  </span>
                </Typography>
                <span style={{ color: "var(--text-color)", opacity: "0.5" }}>
                  |
                </span>
                <Typography>
                  <FontAwesomeIcon icon={faClock} /> {remaingDays.formatedText}
                </Typography>
              </Button>
            </Link>
          ) : (
            nftDetails?.userId?._id != currentUser?.id && (
              <Button
                onClick={onClick}
                disabled={!states?.isAuth}
                className={`${Classes.greenBtn} ${Classes.actionBtn}`}
              >
                <Typography
                  sx={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <ChatOutlinedIcon />
                  <span
                    style={{ fontFamily: "Visby CF Bold", fontSize: "15px" }}
                  >
                    Chat with this NFT owner
                  </span>
                </Typography>
                <span style={{ color: "var(--text-color)", opacity: "0.5" }}>
                  |
                </span>
                <Typography>
                  <FontAwesomeIcon
                    style={{ fontSize: "13px" }}
                    icon={faClock}
                  />{" "}
                  <span style={{ fontSize: "13px" }}>
                    (Pay: {systemSetting?.chatFee} with Piqsol)
                  </span>
                </Typography>
              </Button>
            )
          )
        ) : (
          <></>
        )}
      </Grid>

      <WalletModal isVisible={visible} onClose={() => setVisible(false)} />
    </Box>
  );
};

export default Description;
