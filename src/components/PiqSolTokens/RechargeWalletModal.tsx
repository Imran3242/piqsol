import * as React from "react";
import {
  Button,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  FormControl,
  Divider,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import BinanceLogo from "../../assets/images/binance-logo.png";
import SolLogo from "../../assets/images/solana-logo.png";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Classes from "../../style/Common/Modal.module.scss";
import Styles from "../../style/PiqSolTokens/RechargeWalletModal.module.scss";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import CloseIcon from "@mui/icons-material/Close";
import PiqSolTokenLogo from "../../assets/images/piqsol-token.svg";

import { makeStyles } from "@mui/styles";
import { getUserBalance, getSolanaBalance } from "utils/helpers/getUserBalance";
import { useWallet } from "@solana/wallet-adapter-react";
import { solTransferToAdminWallet } from "../../utils/helpers/solTransferToAdminWallet";

import { addSolToPiqsolConversionTransaction } from "../../store/reducers/userReducer";
import { getSystemSettings } from "store/reducers/systemSettingReducer";
import { setCurrentPQLBalance } from "store/reducers/authReducer";
import { getWeb3 } from "web3/web3";
import {
  CHAIN_CURRENCY,
  CHAIN_LOGOS,
  CHAIN_TITLE,
  extractErrorMessage,
  setPriceUptoThreeDecimal,
} from "components/common/helpers/helpers";
import {
  buyPQLTokens,
  sendEtherAmountToAdminWallet,
} from "../../web3/contractHelpers";
import { useNavigate } from "react-router";

import {
  setIsOpen,
  setIsSuccess,
  setMessage,
} from "store/reducers/errorSuccessMessageReducer";
import { solToUSD } from "utils/helpers/solToDollarsPrice";

const useStyles = makeStyles({
  root: {
    "& .MuiDialogTitle-root": {
      padding: "30px",
    },
  },
});

export default function RechargeWalletModal(props: any) {
  const currentUser = useSelector(
    (state: any) => state.authReducer.currentUser
  );

  const [conversionValue, setConversionValue] = React.useState(undefined);
  const [convertedValue, setConvertedValue] = React.useState(0);
  const [popularItems, setPopularItems] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [allItems, setAllItems] = React.useState("");
  const [loadingMessage, setLoadingMessage] = React.useState(
    "Don’t close your screen, transaction is in progress..."
  );

  const systemSettings = useSelector(
    (state: any) => state.systemSettingReducer.systemSettings
  );

  const overRideStyles = useStyles();
  const wallet = useWallet();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleConversionValueChange = (event) => {
    if (event.target.value && event.target.value !== "") {
      setConversionValue(event.target.value);
    }
    if (!event.target.value || event.target.value === "") {
      setConversionValue(undefined);
    }
  };

  const getUSDpriceOfCurrency = async (
    value: number,
    chainType: string,
    pqlUsdPrice: number
  ) => {
    try {
      const usdPriceNativeCurrency = await solToUSD(value, chainType);

      return parseFloat((usdPriceNativeCurrency / pqlUsdPrice).toFixed(2));
    } catch (err) {
      dispatch(
        setMessage(
          `Something went wrong while price conversion ${extractErrorMessage(
            err
          )}`
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
    }
  };

  const getConversionRateFromSiteSettings = async () => {
    const { piqsolPriceInSol: conversionRate } = systemSettings;
    if (conversionValue) {
      const calculatedPQLTokens = await getUSDpriceOfCurrency(
        conversionValue,
        currentUser?.chainType?.toLowerCase(),
        conversionRate
      );

      setConvertedValue(calculatedPQLTokens);
    }
    if (!conversionValue || conversionValue === "") {
      setConversionValue(undefined);
      setConvertedValue(0);
    }
  };

  React.useEffect(() => {
    getConversionRateFromSiteSettings();
  }, [conversionValue]);

  const handleConversion = async () => {
    try {
      setIsLoading(true);
      const { piqsolPriceInSol: conversionRate } = systemSettings;
      if (conversionRate <= 0) {
        setIsLoading(false);
        dispatch(
          setMessage("Sorry! we're not providing any PQL token for now")
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        return;
      }
      if (currentUser?.chainType.toLowerCase() !== "solana") {
        if (!conversionValue) {
          setIsLoading(false);
          dispatch(
            setMessage(
              `${CHAIN_CURRENCY[currentUser?.chainType]} value required`
            )
          );
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(false));
          return;
        }

        const buyPQLTokensResponse = await sendEtherAmountToAdminWallet(
          conversionValue
        );

        if (buyPQLTokensResponse?.status) {
          setLoadingMessage("Swapping in Progress...");
          const response: any = await dispatch(
            addSolToPiqsolConversionTransaction({
              userWalletAddress: currentUser?.walletAddress,
              adminWalletAddress:
                process.env.REACT_APP_METAMASK_ADMIN_WALLET_ADDRESS,
              txnHashSendAmount: buyPQLTokensResponse?.transactionHash, // For Removing Redundencey
              paidAmount: conversionValue,
              blockchain: currentUser?.chainType?.toLowerCase(),
              paidCurrency: CHAIN_CURRENCY[currentUser?.chainType],
              txnHashPaidAmount: buyPQLTokensResponse?.transactionHash,
              sendAmount: convertedValue,
              status: "success",
              sendCurrency: "PiqSol",
            })
          );

          setIsLoading(false);

          if (response?.success) {
            const { userPiqsolBalance: userUpdatedPQLBalance } =
              await getUserBalance(currentUser?.chainType, wallet);
            dispatch(setCurrentPQLBalance(userUpdatedPQLBalance));
          }
          dispatch(setMessage(response.message));
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(response.success));

          setLoadingMessage(
            "Don’t close your screen, transaction is in progress..."
          );
          props.setOpenRechargeWalletModal(false);

          return;
        }

        dispatch(setMessage("Something went wrong while purchasing PQL"));
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));

        return;
      }

      if (!conversionValue || conversionValue <= 0) {
        setIsLoading(false);
        dispatch(
          setMessage(`${CHAIN_CURRENCY[currentUser?.chainType]} value required`)
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        return;
      }
      const currentSolBalance = await getSolanaBalance(wallet);
      if (currentSolBalance <= conversionValue) {
        setIsLoading(false);
        dispatch(
          setMessage(
            `Insufficient ${CHAIN_CURRENCY[currentUser?.chainType]} Balance`
          )
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        return;
      }

      const { isAllSuccess, signature } = await solTransferToAdminWallet(
        wallet,
        conversionValue
      );

      if (!isAllSuccess) {
        setIsLoading(false);
        dispatch(
          setMessage(
            "Something went wrong while sending sol amount to platform wallet"
          )
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        return;
      }

      setLoadingMessage("Swapping in Progress...");
      const response: any = await dispatch(
        addSolToPiqsolConversionTransaction({
          userWalletAddress: wallet.publicKey.toBase58(),
          adminWalletAddress: process.env.REACT_APP_ADMIN_WALLET_ADDRESS,
          paidAmount: conversionValue,
          blockchain: "Solana",
          paidCurrency: "Sol",
          txnHashPaidAmount: signature,
          sendAmount: convertedValue,
          sendCurrency: "PiqSol",
          txnHashSendAmount: signature,
        })
      );

      setIsLoading(false);

      if (response.success) {
        setTimeout(async () => {
          const { userPiqsolBalance: userUpdatedPQLBalance } =
            await getUserBalance(currentUser?.chainType, wallet);
          dispatch(setCurrentPQLBalance(userUpdatedPQLBalance));
        }, 10000);
      }

      setLoadingMessage(
        "Don’t close your screen, transaction is in progress..."
      );

      dispatch(setMessage(response.message));
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(response.success));
    } catch (err) {
      setIsLoading(false);
      console.log(
        "🚀 ~ file: RechargeWalletModal.tsx ~ line 275 ~ handleConversion ~ err",
        err
      );
      setLoadingMessage(
        "Don’t close your screen, transaction is in progress..."
      );

      dispatch(setMessage(extractErrorMessage(err)));
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
    } finally {
    }
  };

  return (
    <div className={`${Classes.modalWrapper}`}>
      <Dialog
        open={props.openModal}
        onClose={props.closeModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className={`${Classes.dialogWrapper} ${overRideStyles.root}`}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          <Typography className={Classes.modalHeader}>
            <Typography component="h4" className={Classes.modalTitle}>
              Recharge Wallet
            </Typography>
            <CloseIcon
              onClick={props.closeModal}
              className={Classes.closeIcon}
            />
          </Typography>
        </DialogTitle>
        <DialogContent
          className={Styles.modalBodyWrapper}
          sx={{ paddingLeft: "0", paddingRight: "0" }}
        >
          <Typography component="div" className={Styles.blockItem}>
            <TextField
              className={Styles.counter}
              value={conversionValue}
              onChange={(e) =>
                setPriceUptoThreeDecimal(e.target.value, setConversionValue)
              }
              placeholder="0"
              inputMode="decimal"
            />

            <Typography component="div">
              <FormControl sx={{ minWidth: "100%" }}>
                <Select
                  value={allItems}
                  onChange={(event) =>
                    setAllItems(event.target.value as string)
                  }
                  className={Styles.customSelect}
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  IconComponent={() => (
                    <KeyboardArrowDownIcon
                      sx={{
                        position: "relative",
                        right: "8px",
                        opacity: "0.5",
                        color: "var(--text-color)",
                      }}
                    />
                  )}
                >
                  <MenuItem value="">
                    <Typography
                      component="div"
                      className={Styles.listItemInfo}
                      style={{ display: "flex", gap: "5px" }}
                    >
                      <img
                        loading="lazy"
                        src={CHAIN_LOGOS[currentUser?.chainType]}
                        className={Styles.logoImg}
                        style={{
                          height: "25px",
                          width: "25px",
                          objectFit: "contain",
                        }}
                        alt="sol logo"
                      />
                      <span>{CHAIN_CURRENCY[currentUser?.chainType]}</span>
                    </Typography>
                  </MenuItem>
                </Select>
              </FormControl>
            </Typography>
          </Typography>

          <Typography component="div" className={Styles.seprator}>
            <Typography component="span" className={Styles.arrowIcon}>
              <ArrowDownwardIcon sx={{ fontSize: "18px", opacity: "0.6" }} />
            </Typography>
            <Divider />
          </Typography>

          <Typography component="div" className={Styles.blockItem}>
            <Typography component="h4" className={Styles.counter}>
              {convertedValue}
            </Typography>
            <Typography component="div">
              <FormControl sx={{ minWidth: "100%" }}>
                <Select
                  value={popularItems}
                  onChange={(event) =>
                    setPopularItems(event.target.value as string)
                  }
                  className={Styles.customSelect}
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  IconComponent={() => <span></span>}
                >
                  <MenuItem value="">
                    <Typography
                      component="div"
                      className={Styles.listItemInfo}
                      style={{ display: "flex", gap: "5px" }}
                    >
                      <img
                        loading="lazy"
                        src={PiqSolTokenLogo}
                        className={Styles.logoImg}
                        style={{
                          height: "25px",
                          width: "25px",
                          objectFit: "contain",
                        }}
                        alt="binance logo"
                      />
                      <span style={{ color: "var(--text-color)" }}>{`PQL ${
                        CHAIN_TITLE[currentUser?.chainType?.toLowerCase()]
                      }`}</span>
                      <span className={Styles.redIcon}></span>
                    </Typography>
                  </MenuItem>
                </Select>
              </FormControl>
            </Typography>
          </Typography>

          <Typography component="div" className={Styles.actionWrapper}>
            <Button
              className={Styles.actionButton}
              onClick={handleConversion}
              disabled={isLoading}
            >
              {!isLoading ? "Connect Wallet" : "Swapping..."}
            </Button>
          </Typography>

          {isLoading && (
            <Typography className={Classes.loadingMessage}>
              {loadingMessage}
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
