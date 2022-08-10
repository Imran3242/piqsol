import * as React from "react";
import {
  Button,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";

import Classes from "style/Explore/BuyNowModal.module.scss";
import MainPic from "assets/images/card-pic.png";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

import WalletIcon from "../../assets/icons/wallet.png";
import LoadingButton from "@mui/lab/LoadingButton";

import CheckIcon from "@mui/icons-material/Check";
import { getTaxationAmount } from "utils/helpers/customTokenAuctionUtils";
import { solToUSD } from "utils/helpers/solToDollarsPrice";
import { useDispatch, useSelector } from "react-redux";
import {
  CHAIN_CURRENCY,
  getConvertedDecimalPrice,
} from "components/common/helpers/helpers";

import {
  setIsOpen,
  setIsSuccess,
  setMessage,
} from "store/reducers/errorSuccessMessageReducer";

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

export default function BuyNowModal(props: any) {
  const dispatch = useDispatch();
  const [termsAndCondition, setTermsAndContition] =
    React.useState<boolean>(true);
  const [nftPrice, setNftPrice] = React.useState<Number>(0);
  const [nftPriceUsd, setNftPriceUsd] = React.useState<Number>(0);
  const systemSetting = useSelector(
    (state: any) => state?.systemSettingReducer?.systemSettings
  );

  const checkPrice = async () => {
    if (
      props?.auctionData?.auctionType === "fractional" &&
      !props?.mintedFractionDetails
    ) {
      setNftPrice(props?.auctionData?.perBlockPrice);
      const usdPrice = await solToUSD(
        props?.auctionData?.perBlockPrice,
        props?.auctionData?.blockchainType.toLowerCase()
      );
      setNftPriceUsd(usdPrice);
    }

    if (props?.auctionData?.auctionType !== "fractional") {
      setNftPrice(props?.auctionData?.auctionPrice);
      const usdPrice = await solToUSD(
        props?.auctionData?.auctionPrice,
        props?.auctionData?.blockchainType.toLowerCase()
      );
      setNftPriceUsd(usdPrice);
    }
  };

  React.useEffect(() => {
    checkPrice();
  }, [props?.auctionData, props?.mintedFractionDetails]);

  return (
    <Dialog
      open={props.openModal}
      onClose={props.closeModal}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      className={Classes.dialogWrapper}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ padding: "25px" }}>
        <Typography className={Classes.modalHeader}>
          <Typography component="h4" className={Classes.modalTitle}>
            Complete your purchase
          </Typography>
          <CloseIcon onClick={props.closeModal} className={Classes.closeIcon} />
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ padding: "30px" }}>
        <Typography component="div" className={Classes.infoWrapper}>
          <Typography
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Typography component="div" className={Classes.userInfo}>
              <Typography component="h4" className={Classes.itemText}>
                Item
              </Typography>
              <Typography className={Classes.metaInfoWrapper}>
                <Typography component="div">
                  <img
                    src={props.nftData.image}
                    className={Classes.mainPhoto}
                    alt="img"
                  />
                </Typography>
                <Typography component="div">
                  <Typography component="h4" className={Classes.titleName}>
                    {props.nftData.name}
                  </Typography>
                  <Typography component="p" className={Classes.detailInfo}>
                    <span>{props?.nftData?.collectionId?.fullName}</span>{" "}
                    {props?.nftData?.collectionId?.isVerified && (
                      <CheckCircleIcon sx={{ fontSize: "16px" }} />
                    )}
                  </Typography>
                </Typography>
              </Typography>
            </Typography>

            <Typography component="div" className={Classes.priceSection}>
              <Typography component="h4" className={Classes.subtotalText}>
                Subtotal
              </Typography>
              <Typography component="h4" className={Classes.itemPrice}>
                {`${nftPrice} ${
                  CHAIN_CURRENCY[
                    props.auctionData?.blockchainType?.toLowerCase()
                  ]
                }`}
              </Typography>
              <Typography component="h4" className={Classes.priceInUsd}>
                {`$${nftPriceUsd}`}
              </Typography>
            </Typography>
          </Typography>

          <Typography
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography component="h4" className={Classes.royalityText}>
              Royalty fee
            </Typography>
            <Typography component="h4" className={Classes.royaltyFee}>
              {Number(props?.nftData?.seller_fee_basis_points || 0) / 100} %
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
                {systemSetting?.buyNowPiqsolFee} PQL
              </Typography>
            </Typography>
            <Typography component="div" className={Classes.balance}>
              <b className="VisbyExtrabold">Balance:</b>
              <span>
                {getConvertedDecimalPrice(Number(props?.userPQLbalance))} PQL
              </span>
            </Typography>
          </Typography>
        </Typography>

        <Typography component="div" className={Classes.totalInfoWrapper}>
          <Typography component="h4" className={Classes.totalText}>
            Total
            <span className={Classes.agree}>{" (Excluding Platform Fee)"}</span>
          </Typography>
          <Typography className={`VisbyExtrabold ${Classes.totalInfo}`}>
            {`${nftPrice} ${
              CHAIN_CURRENCY[props.auctionData?.blockchainType?.toLowerCase()]
            }`}
          </Typography>
        </Typography>

        <Typography component="div">
          <FormGroup>
            <FormControlLabel
              sx={{ alignItems: "flex-start" }}
              control={
                <Checkbox
                  onChange={(e) => setTermsAndContition(e.target.checked)}
                  defaultChecked
                  sx={{ paddingTop: "0" }}
                  icon={<CustomUnMarkIcon />}
                  checkedIcon={<CustomMarkIcon />}
                />
              }
              label={
                <Typography component="div" className={Classes.agree}>
                  I agree to all terms and conditions of the PIQSOL web platform
                  and duly accept the entire copyright transfer agreement
                  included in the terms and conditions section of the platform.
                </Typography>
              }
            />
          </FormGroup>
        </Typography>

        <Typography className={Classes.modalActionWrapper}>
          <Button
            variant="contained"
            className={`gradientButton ${Classes.buynowBtn}`}
            startIcon={
              <img
                src={WalletIcon}
                alt="WalletIcon"
                style={{ height: "18px" }}
              />
            }
            onClick={() => {
              if (props.buyNftLoader) return false;
              if (termsAndCondition) {
                return props?.buyNftHandler();
              }
              dispatch(setMessage("Please accept terms and condition"));
              dispatch(setIsOpen(true));
              dispatch(setIsSuccess(false));
            }}
          >
            {props.buyNftLoader ? "Please wait" : "Buy Now"}
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
  );
}
