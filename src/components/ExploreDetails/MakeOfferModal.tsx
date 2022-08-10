import * as React from "react";
import {
  Button,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Classes from "../../style/Explore/MakeOffer.module.scss";
import TelegramIcon from "@mui/icons-material/Telegram";
import InputUnstyled from "@mui/base/InputUnstyled";
import { solToUSD } from "utils/helpers/solToDollarsPrice";
import { useSelector } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { CHAIN_CURRENCY, CHAIN_LOGOS } from "components/common/helpers/helpers";

export default function MakeOfferModal(props: any) {
  const {
    openModal,
    closeModal,
    makeAnOfferHandler,
    bidAmount,
    onBidAmountChange,
    auctionData,
  } = props;

  const [bidAmountInUSD, setBidAmountInUSD] = React.useState<number>(0);
  const systemSetting = useSelector(
    (state: any) => state?.systemSettingReducer?.systemSettings
  );
  const getAmountsInUSD = async () => {
    if (bidAmount) {
      const convertedAmount = await solToUSD(
        bidAmount,
        auctionData?.blockchainType.toLowerCase()
      );
      setBidAmountInUSD(convertedAmount);
    }
  };
  React.useEffect(() => {
    if (bidAmount) {
      getAmountsInUSD();
    }
  }, [bidAmount]);
  return (
    <div className={Classes.modalWrapper}>
      <Dialog
        open={openModal}
        onClose={closeModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className={Classes.dialogWrapper}
        sx={{ "& .MuiDialog-paperWidthSm": { maxWidth: "585px" } }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ padding: "25px" }}>
          <Typography className={Classes.modalHeader}>
            <Typography component="h4" className={Classes.modalTitle}>
              Make an Offer
            </Typography>
            <CloseIcon onClick={closeModal} className={Classes.closeIcon} />
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ padding: "30px" }}>
          <Typography component="div" className={Classes.infoItemWrapper}>
            <Typography component="label" className={Classes.label}>
              Offer Price
            </Typography>
            <Typography component="div" className={Classes.item}>
              <Typography sx={{ flexGrow: "1" }}>
                <InputUnstyled
                  onChange={(e) => onBidAmountChange(e.target.value)}
                  value={bidAmount}
                  className={Classes.customInput}
                />
                <Typography component="h4" className={Classes.price}>
                  {`$${bidAmountInUSD.toFixed(2)}`}
                </Typography>
              </Typography>

              <Typography className={Classes.actionBtnWrapper}>
                {/* <Button className={Classes.useMax}>USE MAX</Button> */}
                <Button className={Classes.solBtn}>
                  <img
                    src={
                      CHAIN_LOGOS[
                        props?.auctionData?.blockchainType?.toLowerCase()
                      ]
                    }
                    alt="SolLogo"
                    className={Classes.solLogo}
                  />{" "}
                  {
                    CHAIN_CURRENCY[
                      props?.auctionData?.blockchainType?.toLowerCase()
                    ]
                  }
                </Button>
              </Typography>
            </Typography>
          </Typography>

          <Typography component="div" className={Classes.platformFee}>
            <Typography component="label" className={Classes.platformFeeLabel}>
              Platform fee
            </Typography>
            <Typography component="div" className={Classes.platformInfoBlock}>
              <Typography component="div">
                <Typography component="p" className={Classes.price}>
                  {systemSetting?.makeAnOfferPiqsolFee} PQL
                </Typography>
              </Typography>
              <Typography component="div" className={Classes.balnce}>
                <b className="VisbyExtrabold">Balance:</b>
                <span className="VisbyDemiBold">
                  {props?.userPQLbalance} PQL
                </span>
              </Typography>
            </Typography>
          </Typography>

          <Typography className={Classes.modalActionWrapper}>
            <Button
              variant="contained"
              className={`gradientButton ${Classes.buynowBtn}`}
              startIcon={<TelegramIcon sx={{ fontSize: "25px !important" }} />}
              onClick={makeAnOfferHandler}
            >
              {props.buyNftLoader ? "Please wait" : "Send Offer"}
              {props.buyNftLoader && (
                <CircularProgress
                  style={{ color: "white", marginLeft: 10 }}
                  size={16}
                />
              )}
              <div className="fill-two"></div>
            </Button>
            {props.buyNftLoader && (
              <Typography
                sx={{ color: "var(--text-color)" }}
                className="warning-msg"
              >
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="color-red"
                />{" "}
                Don't close the window.
              </Typography>
            )}
          </Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
}
