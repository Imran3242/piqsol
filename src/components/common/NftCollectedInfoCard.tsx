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
import Classes from "style/Common/InfoCard.module.scss";
import UserImg from "../../assets/icons/user.png";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserFavouriteNft,
  updateUserNftFavourtie,
} from "store/reducers/favouriteReducer";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "store/reducers/authReducer";
import { WalletModal } from "components/walletAdapter";
import { getNftAuction } from "store/reducers/auctionReducer";
import { CHAIN_LOGOS, CHAIN_TITLE } from "./helpers/helpers";

export default function NftCollectedInfoCard(props: {
  data?: any;
  favourite?: boolean;
  className?: string;
  showBottomInfo?: boolean;
  showBadges?: boolean;
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(
    (state: any) => state.authReducer.currentUser
  );

  const [walletModelVisible, setWalletVisible] = useState<boolean>(false);
  const { data, showBadges = true } = props;

  const imgEl = React.useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [isFavourite, setIsFavourite] = React.useState(false);

  const onImageLoaded = () => setLoaded(true);

  const favourties = useSelector(
    (state: any) => state.favouriteReducer.userFavourties
  );
  useEffect(() => {
    const favourite = favourties.find(
      (fav: any) => fav?.nftId?._id === data?._id
    );
    if (favourite) {
      setIsFavourite(true);
    }
  }, [favourties]);
  useEffect(() => {
    const imgElCurrent = imgEl.current;

    if (imgElCurrent) {
      imgElCurrent.addEventListener("load", onImageLoaded);
      return () => imgElCurrent.removeEventListener("load", onImageLoaded);
    }
  }, [imgEl]);

  const userImgEl = React.useRef<HTMLImageElement>(null);
  const [userLoaded, setUserLoaded] = React.useState(false);
  const [auction, setAuction] = React.useState<any>({});
  const fetchAuction = async (nftId: string) => {
    const auctionData = await dispatch(getNftAuction(nftId));
    setAuction(auctionData);
  };
  useEffect(() => {
    if (data?._id) {
      fetchAuction(data?._id);
    }
  }, [data]);
  const onUserImgLoad = () => setUserLoaded(true);

  useEffect(() => {
    const userImgElCurrent = userImgEl.current;

    if (userImgElCurrent) {
      userImgElCurrent.addEventListener("load", onUserImgLoad);
      return () => userImgElCurrent.removeEventListener("load", onUserImgLoad);
    }
  }, [userImgEl]);

  const updateUserFavourtie = async () => {
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
    navigate(
      `/${data?.collectionId?.userId}/myCreated/detail/${data?.collectionId?._id}/items`
    );
    return;
  };

  return (
    <>
      <Card className={`${Classes.cardItem} ${props.className}`}>
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
            image={
              data?.collectionId?.avatar
                ? data?.collectionId?.avatar
                : CardMainPhoto
            }
            alt="green iguana"
            style={loaded ? { display: "inline-block" } : { display: "none" }}
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

          <CardContent className={Classes.cardDesc} onClick={onClickHandler}>
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
                  src={data?.userId?.avatar || UserImg}
                  alt="user img"
                  className={Classes.userImg}
                  style={
                    userLoaded
                      ? { display: "inline-block" }
                      : { display: "none" }
                  }
                />
              </Typography>
              <Typography className={Classes.userName} component="span">
                {data?.userId?.fullName || data?.userId?.name}
              </Typography>
              <Typography component="div">
                <CheckCircleIcon className={Classes.verifiedIcon} />
              </Typography>
            </Typography>

            <Typography
              gutterBottom
              component="div"
              className={Classes.cardName}
            >
              {data?.collectionId?.fullName}
            </Typography>
          </CardContent>
        </Box>
        <Box className={Classes.cardBottom} onClick={onClickHandler}>
          <Typography component="div">
            <Typography component="div" className={`${Classes.title} eTitle`}>
              Total Offers
            </Typography>
            <Typography component="div" className={`${Classes.info} eInfo`}>
              {auction?.bids?.length ?? 0}
            </Typography>
          </Typography>
          <Typography component="div">
            <Typography component="div" className={`${Classes.title} eTitle`}>
              Total Reviews
            </Typography>
            <Typography component="div" className={`${Classes.info} eInfo`}>
              {data?.views?.length ? data?.views?.length : 0}
            </Typography>
          </Typography>
          <Typography component="div">
            <Typography component="div" className={`${Classes.title} eTitle`}>
              Current price
            </Typography>
            <Typography component="div" className={`${Classes.info} eInfo`}>
              {data?.currentPrice} PQL
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
