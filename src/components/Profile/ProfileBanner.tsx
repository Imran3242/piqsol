import React, { useEffect } from "react";
import ProfileBannerImg from "../../assets/images/profile-banner.png";
import ProfileImg from "../../assets/icons/user.png";
import { Typography, Box, Skeleton } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareNodes, faGear } from "@fortawesome/free-solid-svg-icons";
import Classes from "../../style/Common/PageBanner.module.scss";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useParams } from "react-router";
import Moment from "moment";
import { useWallet } from "@solana/wallet-adapter-react";
import ShareWindow from "components/common/ShareWindow";
import { fetchUserDetails } from "store/reducers/userReducer";

const ProfileBanner = () => {
  const wallet = useWallet();
  const dispatch = useDispatch();

  const params = useParams();

  const [CurentUserData, setCurentUserData] = React.useState<any>(undefined);
  const [createdAt, setCreatedAt] = React.useState(undefined);
  const [joinedDate, setJoinedDate] = React.useState(undefined);

  const imgEl = React.useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = React.useState(true);

  const onImageLoaded = () => setLoaded(true);

  useEffect(() => {
    const imgElCurrent = imgEl.current;

    if (imgElCurrent) {
      imgElCurrent.addEventListener("load", onImageLoaded);
      return () => imgElCurrent.removeEventListener("load", onImageLoaded);
    }
  }, [imgEl]);

  const fetchAndUpdateUserData = async () => {
    const userData: any = await dispatch(fetchUserDetails(params?.id));
    setCreatedAt(userData?.createdAt);
    setJoinedDate(Moment(userData?.createdAt).format("MMM YYYY"));
    setCurentUserData(userData);
  };

  React.useEffect(() => {
    fetchAndUpdateUserData();
  }, [params?.id]);

  useEffect(() => {
    fetchAndUpdateUserData();
  }, []);

  const userImgEl = React.useRef<HTMLImageElement>(null);
  const [userLoaded, setUserLoaded] = React.useState(false);
  const [openShareModel, setOpenShareModel] = React.useState(false);

  const onUserImgLoad = () => setUserLoaded(true);

  useEffect(() => {
    const userImgElCurrent = userImgEl.current;

    if (userImgElCurrent) {
      userImgElCurrent.addEventListener("load", onUserImgLoad);
      return () => userImgElCurrent.removeEventListener("load", onUserImgLoad);
    }
  }, [userImgEl]);

  const handleShare = () => {
    setOpenShareModel(true);
  };

  const handleCloseShare = () => {
    setOpenShareModel(false);
  };

  return (
    <Box className={Classes.bannerArea}>
      <ShareWindow
        openShareModel={openShareModel}
        closeShareModel={handleCloseShare}
        url={`${process.env.REACT_APP_SITE_BASE_URL}${params?.id}/myCollected`}
      />
      <Typography component="div" className={Classes.bannerImgArea}>
        <Skeleton
          variant="rectangular"
          style={
            !loaded
              ? { display: "block", height: "220px" }
              : { display: "none" }
          }
          width="100%"
        ></Skeleton>
        <img
          loading="lazy"
          className={Classes.bannerImg}
          src={CurentUserData?.cover ?? ProfileBannerImg}
          alt="profile banner img"
          ref={imgEl}
          style={loaded ? { display: "inline-block" } : { display: "none" }}
        />
        <Typography component="div" className={Classes.bannerActions}>
          <Typography
            component="div"
            className={Classes.bannerActionItem}
            onClick={handleShare}
          >
            <FontAwesomeIcon
              icon={faShareNodes}
              className={Classes.icon}
              style={{ color: "#1D9BF0" }}
            />
          </Typography>
          <Link to="/settings">
            <Typography component="div" className={Classes.bannerActionItem}>
              <FontAwesomeIcon
                icon={faGear}
                className={Classes.icon}
                style={{ color: "#949494" }}
              />
            </Typography>
          </Link>
        </Typography>
      </Typography>
      <Box>
        <Typography component="div" className={Classes.userImgArea}>
          <Skeleton
            variant="circular"
            width={145}
            height={145}
            style={!userLoaded ? { display: "block" } : { display: "none" }}
          ></Skeleton>
          <img
            loading="lazy"
            ref={userImgEl}
            className={Classes.userImg}
            src={CurentUserData?.avatar ?? ProfileImg}
            alt="profile banner img"
            style={
              userLoaded ? { display: "inline-block" } : { display: "none" }
            }
          />
        </Typography>
        <Typography
          component="h3"
          className={`VisbyExtrabold ${Classes.userName}`}
        >
          {CurentUserData?.name || CurentUserData?.fullName}
        </Typography>
        <Typography component="p" className={Classes.metaInfo}>
          {CurentUserData?.walletAddress}
        </Typography>
        <Typography component="p" className={Classes.metaInfo}>
          Joined {joinedDate}
        </Typography>
      </Box>
    </Box>
  );
};

export default ProfileBanner;
