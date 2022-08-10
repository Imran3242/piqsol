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
import Classes from "style/Common/TrendingNftInfoCard.module.scss";
import UserImg from "../../assets/icons/user.png";
import FractionIcon from "assets/icons/fraction-icon.png";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  getUserFavouriteNft,
  updateUserNftFavourtie,
} from "store/reducers/favouriteReducer";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfile } from "store/reducers/authReducer";
import { WalletModal } from "components/walletAdapter";
import { useNavigate } from "react-router-dom";
import { CHAIN_TITLE, CHAIN_LOGOS, CHAIN_CURRENCY } from "./helpers/helpers";

export default function TrendingNftInfoCard(props: {
  data?: any;
  favourite?: boolean;
  className?: string;
  showBottomInfo?: boolean;
  showBadges?: boolean;
  auctionData?: any;
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data, showBottomInfo = true, showBadges = true } = props;

  const imgEl = React.useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = React.useState(false);

  const onImageLoaded = () => setLoaded(true);

  const currentUser = useSelector(
    (state: any) => state.authReducer.currentUser
  );

  const userFavourties = useSelector(
    (state: any) => state.favouriteReducer.userFavourties
  );

  useEffect(() => {
    const favourite = userFavourties.find(
      (fav: any) => fav?.nftId?._id === data?._id
    );
    if (favourite) {
      setIsFavourite(true);
    }
  }, [userFavourties]);

  useEffect(() => {
    const imgElCurrent = imgEl.current;

    if (imgElCurrent) {
      imgElCurrent.addEventListener("load", onImageLoaded);
      return () => imgElCurrent.removeEventListener("load", onImageLoaded);
    }
  }, [imgEl]);

  const userImgEl = React.useRef<HTMLImageElement>(null);
  const [userLoaded, setUserLoaded] = React.useState(false);
  const [isFavourite, setIsFavourite] = React.useState(false);
  const [walletModelVisible, setWalletVisible] = useState<boolean>(false);

  const onUserImgLoad = () => setUserLoaded(true);

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

  useEffect(() => {
    const favourite = userFavourties.find(
      (fav: any) => fav?.nftId?._id === data?._id
    );
    if (favourite) {
      setIsFavourite(true);
    }
  }, [userFavourties]);

  useEffect(() => {
    const userImgElCurrent = userImgEl.current;

    if (userImgElCurrent) {
      userImgElCurrent.addEventListener("load", onUserImgLoad);
      return () => userImgElCurrent.removeEventListener("load", onUserImgLoad);
    }
  }, [userImgEl]);

  return (
    <>
      <Card className={`${Classes.cardItem} ${props.className}`}>
        {showBadges && (
          <Typography component="div" className={Classes.badgeWrapper}>
            <Typography component="div" className={Classes.badge}>
              <img
                loading="lazy"
                src={CHAIN_LOGOS[data?.nftDetail?.blockchainType]}
                className={Classes.icon}
                alt="cardbadge"
              />

              <Typography component="span" className={Classes.badgeName}>
                {CHAIN_TITLE[data?.nftDetail?.blockchainType]}
              </Typography>
            </Typography>
            {data?.auctionDetail?.auctionType === "fractional" && (
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

        <Box
          onClick={() => {
            navigate(`/explore/explore-details/${data?._id}`);
          }}
          className={Classes.cardTop}
        >
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
            image={data?.nftDetail?.image || CardMainPhoto}
            alt="green iguana"
            style={loaded ? { display: "inline-block" } : { display: "none" }}
          />
          <Typography component="div" className={Classes.likeButtonWrapper}>
            <IconButton
              onClick={updateUserFavourtie}
              className={Classes.likeButton}
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
                  ref={userImgEl}
                  src={data?.userDetail?.avatar || UserImg}
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
                {data?.userDetail?.fullName ||
                  data?.userDetail?.name ||
                  data?.userDetail?.walletAddress}
              </Typography>
              <Typography component="div">
                {data?.userDetail?.isVerified && (
                  <CheckCircleIcon className={Classes.verifiedIcon} />
                )}
              </Typography>
            </Typography>
            <Typography
              gutterBottom
              component="div"
              className={`${Classes.cardName}`}
            >
              {data?.nftDetail?.name}
            </Typography>
          </CardContent>
        </Box>
        {showBottomInfo && (
          <Box
            onClick={() => {
              navigate(`/explore/explore-details/${data?._id}`);
            }}
            className={Classes.cardBottom}
          >
            {data?.auctionDetail && (
              <Typography component="div">
                <Typography
                  component="div"
                  className={`${Classes.title} eTitle`}
                >
                  Total Offers
                </Typography>
                <Typography component="div" className={`${Classes.info}`}>
                  {data?.auctionDetail?.bids?.length}
                </Typography>
              </Typography>
            )}
            <Typography component="div">
              <Typography component="div" className={`${Classes.title}`}>
                Total Reviews
              </Typography>
              <Typography component="div" className={`${Classes.info}`}>
                {data?.nftDetail?.views?.length}
              </Typography>
            </Typography>
            <Typography component="div">
              <Typography component="div" className={`${Classes.title}`}>
                Current price
              </Typography>
              <Typography component="div" className={`${Classes.info}`}>
                {`${data?.nftDetail?.currentPrice} ${
                  CHAIN_CURRENCY[data?.nftDetail?.blockchainType?.toLowerCase()]
                }`}
              </Typography>
            </Typography>
          </Box>
        )}
        <WalletModal
          isVisible={walletModelVisible}
          onClose={() => setWalletVisible(false)}
        />
      </Card>
    </>
  );
}
