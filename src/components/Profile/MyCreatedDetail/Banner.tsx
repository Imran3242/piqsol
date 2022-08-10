import React from "react";
import BannerImg from "../../../assets/images/profile-banner.png";
import CreatedImg from "../../../assets/icons/user.png";
import { Typography, Box, Skeleton } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faEllipsis } from "@fortawesome/free-solid-svg-icons";
import {
  faDiscord,
  faInstagram,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";

import Classes from "../../../style/Common/PageBanner.module.scss";
import { getCreatedByNameForCollection } from "../helpers/helpers";
import {
  CHAIN_LOGOS,
  CHAIN_TITLE,
  getConvertedDecimalPrice,
} from "components/common/helpers/helpers";
import { useSelector } from "react-redux";

const MyCreatedBanner = (props: { data: any }) => {
  const collectionBannerEl = React.useRef<HTMLImageElement>(null);
  const [collectionBannerLoaded, setcollectionBannerLoaded] =
    React.useState(false);
  const onCollectionBannerLoad = () => setcollectionBannerLoaded(true);

  const currentUser = useSelector(
    (state: any) => state?.authReducer?.currentUser
  );

  const collectionAvatarEl = React.useRef<HTMLImageElement>(null);
  const [collectionAvatarLoaded, setcollectionAvatarLoaded] =
    React.useState(false);
  const onCollectionAvatarLoad = () => setcollectionAvatarLoaded(true);

  React.useEffect(() => {
    const collectionBannerElCurrent = collectionBannerEl.current;

    if (collectionBannerElCurrent) {
      collectionBannerElCurrent.addEventListener(
        "load",
        onCollectionBannerLoad
      );
      return () =>
        collectionBannerElCurrent.removeEventListener(
          "load",
          onCollectionBannerLoad
        );
    }
  }, [collectionBannerEl]);

  React.useEffect(() => {
    const collectionAvatarElCurrent = collectionAvatarEl.current;

    if (collectionAvatarElCurrent) {
      collectionAvatarElCurrent.addEventListener(
        "load",
        onCollectionAvatarLoad
      );
      return () =>
        collectionAvatarElCurrent.removeEventListener(
          "load",
          onCollectionAvatarLoad
        );
    }
  }, [collectionAvatarEl]);

  const { data } = props;
  return (
    <Box className={Classes.bannerArea}>
      <Typography component="div" className={Classes.bannerImgArea}>
        <Skeleton
          variant="rectangular"
          style={
            !collectionBannerLoaded
              ? { display: "block", height: "220px" }
              : { display: "none" }
          }
          width="100%"
        ></Skeleton>
        <img
          loading="lazy"
          ref={collectionBannerEl}
          className={Classes.bannerImg}
          src={data?.cover}
          alt="collection banner img"
          style={
            collectionBannerLoaded
              ? { display: "inline-block" }
              : { display: "none" }
          }
        />
        <Typography component="div" className={Classes.bannerActions}>
          <Typography component="div" className={Classes.bannerActionItem}>
            <FontAwesomeIcon
              icon={faDiscord}
              className={Classes.icon}
              style={{ color: "#6654FD" }}
            />
          </Typography>
          <Typography component="div" className={Classes.bannerActionItem}>
            <FontAwesomeIcon
              icon={faInstagram}
              className={Classes.icon}
              style={{ color: "#F4388E" }}
            />
          </Typography>
          <Typography component="div" className={Classes.bannerActionItem}>
            <FontAwesomeIcon
              icon={faTwitter}
              className={Classes.icon}
              style={{ color: "#1D9BF0" }}
            />
          </Typography>
          <Typography component="div" className={Classes.bannerActionItem}>
            <FontAwesomeIcon
              icon={faEllipsis}
              className={Classes.icon}
              style={{ color: "#919191" }}
            />
          </Typography>
        </Typography>
      </Typography>
      <Box>
        <Typography component="div" className={Classes.userImgArea}>
          <Skeleton
            variant="circular"
            width={145}
            height={145}
            style={
              !collectionAvatarLoaded
                ? { display: "block" }
                : { display: "none" }
            }
          ></Skeleton>
          <img
            loading="lazy"
            ref={collectionAvatarEl}
            className={Classes.userImg}
            src={data?.avatar}
            alt="collection avatar img"
            style={
              collectionAvatarLoaded
                ? { display: "inline-block" }
                : { display: "none" }
            }
          />
        </Typography>
        <Typography component="h3" className={Classes.userName}>
          {`${data?.fullName}`}
          {data?.isVerified && (
            <FontAwesomeIcon
              icon={faCircleCheck}
              className={Classes.verifiedIcon}
            />
          )}
        </Typography>

        <Typography component="div" className={Classes.createdInfo}>
          <Typography className={Classes.createdTitle}>Created by</Typography>
          <Typography className={Classes.createdName}>
            <span>{getCreatedByNameForCollection(data?.userId)}</span>{" "}
            {data?.userId?.isVerified && <CheckCircleIcon fontSize="small" />}
          </Typography>
        </Typography>
        <Typography component="div" className={Classes.countInfoWrapper}>
          <Typography component="div" className={Classes.countItem}>
            <Typography component="h4" className={Classes.count}>
              {getConvertedDecimalPrice(data?.floorPrice)}
            </Typography>
            <Typography component="h4" className={Classes.countInfo}>
              Floor price
            </Typography>
          </Typography>
          <Typography component="div" className={Classes.countItem}>
            <Typography component="h4" className={Classes.count}>
              {data?.nftCount}
            </Typography>
            <Typography component="h4" className={Classes.countInfo}>
              Items
            </Typography>
          </Typography>
          <Typography component="div" className={Classes.countItem}>
            <Typography component="h4" className={Classes.count}>
              {getConvertedDecimalPrice(data?.totalVolume)}
            </Typography>
            <Typography component="h4" className={Classes.countInfo}>
              Total Volume
            </Typography>
          </Typography>
          <Typography component="div" className={Classes.countItem}>
            <Typography component="h4" className={Classes.count}>
              {data?.avgSalePrice ? data?.avgSalePrice?.toFixed(2) : 0}
            </Typography>
            <Typography component="h4" className={Classes.countInfo}>
              Avg Sale Price
            </Typography>
          </Typography>
          <Typography
            component="div"
            className={Classes.countItem}
            style={{ textAlign: "center" }}
          >
            <img
              src={CHAIN_LOGOS[data?.blockchainType?.toLowerCase() || "solana"]}
            />
            <Typography component="h4" className={Classes.countInfo}>
              {CHAIN_TITLE[data?.blockchainType?.toLowerCase() || "solana"]}
            </Typography>
          </Typography>
        </Typography>
        <Typography component="p" className={Classes.description}>
          {data?.description}
        </Typography>
      </Box>
    </Box>
  );
};

export default MyCreatedBanner;
