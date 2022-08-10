import React, { useState, useEffect } from "react";
import {
  IconButton,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Skeleton,
  Box,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CardMainPhoto from "../../assets/images/card-pic.png";
import FractionIcon from "assets/icons/fraction-icon.png";
import Classes from "style/Common/InfoCard.module.scss";
import UserImg from "../../assets/icons/user.png";
import { walletAddressString } from "../../utils/helpers/walletAddressString";
import placeHolderImage from "../../assets/images/imagePlaceholder.png";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentPrice } from "../../utils/helpers/getCurrentPrice";
import {
  getUserFavouriteNft,
  updateUserNftFavourtie,
} from "store/reducers/favouriteReducer";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "store/reducers/authReducer";
import { WalletModal } from "components/walletAdapter";
import { useWallet } from "@solana/wallet-adapter-react";
import { CHAIN_CURRENCY, CHAIN_LOGOS, CHAIN_TITLE } from "./helpers/helpers";

export default function InfoCard(props: {
  data?: any;
  favourite?: boolean;
  className?: string;
  showBottomInfo?: boolean;
  showBadges?: boolean;
  auctionData?: any;
  isOwned?: boolean;
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const wallet = useWallet();

  const userFavourties = useSelector(
    (state: any) => state.favouriteReducer.userFavourties
  );

  const currentUser = useSelector(
    (state: any) => state.authReducer.currentUser
  );

  const [cardImage, setCardImage] = useState<string>();
  const [walletModelVisible, setWalletVisible] = useState<boolean>(false);
  const { data, showBadges = true } = props;

  useEffect(() => {
    if (
      (data && !data?.image) ||
      data?.image.includes("mp4") ||
      data?.image.includes("mp3")
    ) {
      setCardImage(placeHolderImage);
    } else {
      setCardImage(data?.image);
    }
  }, [userFavourties, data]);

  const imgEl = React.useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [isFavourite, setIsFavourite] = React.useState(false);

  const onImageLoaded = () => setLoaded(true);

  useEffect(() => {
    const imgElCurrent = imgEl.current;

    if (imgElCurrent) {
      imgElCurrent.addEventListener("load", onImageLoaded);
      return () => imgElCurrent.removeEventListener("load", onImageLoaded);
    }
  }, [imgEl]);

  useEffect(() => {
    const favourite = userFavourties.find(
      (fav: any) => fav?.nftId?._id === data?._id
    );
    if (favourite) {
      setIsFavourite(true);
    }
  }, [userFavourties]);

  const userImgEl = React.useRef<HTMLImageElement>(null);
  const [userLoaded, setUserLoaded] = React.useState(false);

  const onUserImgLoad = () => setUserLoaded(true);

  useEffect(() => {
    const userImgElCurrent = userImgEl.current;

    if (userImgElCurrent) {
      userImgElCurrent.addEventListener("load", onUserImgLoad);
      return () => userImgElCurrent.removeEventListener("load", onUserImgLoad);
    }
  }, [userImgEl]);

  const updateUserFavourtie = async (e) => {
    e.stopPropagation();
    if (currentUser) {
      const favourtieUpdate: any = await dispatch(
        updateUserNftFavourtie({ nftId: data?._id })
      );
      if (favourtieUpdate?.type === "deleted") {
        setIsFavourite(false);
      } else {
        setIsFavourite(true);
      }
      dispatch(getUserFavouriteNft(currentUser?.id));
      dispatch(getUserProfile());
      return;
    }
    setWalletVisible(true);
  };

  const onClickHandler = async () => {
    navigate(`/explore/explore-details/${data?._id}`, { replace: true });
  };

  const getUserNameOrWalletAddress = (data: any) => {
    if (data?.userId?.fullName) return data?.userId?.fullName;
    if (data?.userId?.name) return data?.userId?.name;
    return walletAddressString(data?.userId?.walletAddress);
  };

  const getNftName = (name: string) => {
    if (name != "" && name?.length > 20) return name.slice(0, 17) + "...";
    return name;
  };
  return (
    <>
      <Card
        className={`${Classes.cardItem} ${props.className}`}
        onClick={onClickHandler}
      >
        {showBadges && (
          <Typography component="div" className={Classes.badgeWrapper}>
            <Typography component="div" className={Classes.badge}>
              <img
                loading="lazy"
                src={CHAIN_LOGOS[data?.blockchainType]}
                className={Classes.icon}
                alt="cardbadge"
              />
              <Typography component="span" className={Classes.badgeName}>
                {CHAIN_TITLE[data?.blockchainType]}
              </Typography>
            </Typography>
            {(props?.auctionData?.nftId?.nftType === "Fraction" ||
              data?.nftType === "Fraction" ||
              data?.activeAuction?.auctionType === "fractional" ||
              props?.auctionData?.auctionType === "fractional") && (
              <Typography component="div" className={Classes.fractionBadge}>
                <img
                  loading="lazy"
                  src={FractionIcon}
                  className={Classes.factionIconImg}
                  alt="cardbadge"
                />
              </Typography>
            )}
          </Typography>
        )}

        <Box className={Classes.cardTop}>
          <Skeleton
            variant="rectangular"
            style={
              !loaded
                ? { display: "block", height: "273px" }
                : { display: "none" }
            }
            width="100%"
          ></Skeleton>
          <CardMedia
            ref={imgEl}
            component="img"
            height="273"
            image={cardImage ? cardImage : CardMainPhoto}
            alt="green iguana"
            style={
              loaded
                ? { display: "inline-block", cursor: "pointer" }
                : { display: "none" }
            }
            className={Classes.mainImg}
          />
          <Typography component="div" className={Classes.likeButtonWrapper}>
            <IconButton
              className={Classes.likeButton}
              onClick={updateUserFavourtie}
            >
              <FavoriteIcon
                className={isFavourite ? Classes.likedIcon : Classes.favIcon}
              />
            </IconButton>
          </Typography>

          <CardContent className={Classes.cardDesc}>
            <Typography component="div" className={Classes.userInfo}>
              <Typography component="div">
                <Skeleton
                  variant="circular"
                  width={20}
                  height={20}
                  style={
                    !userLoaded ? { display: "block" } : { display: "none" }
                  }
                ></Skeleton>
                <img
                  loading="lazy"
                  ref={userImgEl}
                  src={
                    props?.auctionData?.userId?.avatar ||
                    data?.userId?.avatar ||
                    UserImg
                  }
                  alt="user img"
                  className={Classes.userImg}
                  style={
                    userLoaded
                      ? { display: "inline-block" }
                      : { display: "none" }
                  }
                />
              </Typography>
              <Typography className={`${Classes.userName}`} component="span">
                {getUserNameOrWalletAddress(props?.data || props?.auctionData)}
              </Typography>
              <Typography component="div">
                {(props?.auctionData?.userId?.isVerified ||
                  data?.userId?.isVerified) && (
                  <CheckCircleIcon className={Classes.verifiedIcon} />
                )}
              </Typography>
            </Typography>

            <Typography
              gutterBottom
              component="div"
              className={`${Classes.cardName}`}
            >
              {getNftName(data?.name || data?.fullName)}
            </Typography>
          </CardContent>
        </Box>
        <Box className={Classes.cardBottom}>
          <Typography component="div">
            <Typography component="div" className={`${Classes.title}`}>
              Total Offers
            </Typography>
            <Typography component="div" className={`${Classes.info}`}>
              {props?.auctionData?.bids?.length > 0
                ? props?.auctionData?.bids?.length
                : 0}
            </Typography>
          </Typography>
          <Typography component="div">
            <Typography component="div" className={`${Classes.title}`}>
              Total Reviews
            </Typography>
            <Typography component="div" className={`${Classes.info}`}>
              {data?.views?.length ? data?.views?.length : 0}
            </Typography>
          </Typography>
          <Typography component="div">
            <Typography component="div" className={`${Classes.title}`}>
              Current price
            </Typography>
            <Typography component="div" className={`${Classes.info}`}>
              {`${getCurrentPrice(
                props?.auctionData,
                props?.data,
                props?.auctionData?.bids?.sort(
                  (a: any, b: any) => b?.price - a?.price
                )
              )} ${
                CHAIN_CURRENCY[
                  props.auctionData?.blockchainType?.toLowerCase() ||
                    props?.data?.blockchainType?.toLowerCase()
                ] || "SOL"
              }`}
            </Typography>
          </Typography>
        </Box>
        <WalletModal
          isVisible={walletModelVisible}
          onClose={() => setWalletVisible(false)}
        />
      </Card>
    </>
  );
}
