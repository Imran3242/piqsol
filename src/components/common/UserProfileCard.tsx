import React, { useEffect } from "react";
import ProfileBannerImg from "../../assets/images/profile-banner.png";
import ProfileImg from "../../assets/icons/user.png";
import { Typography, Box, Skeleton } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareNodes, faGear } from "@fortawesome/free-solid-svg-icons";
import Classes from "../../style/Common/PageBanner.module.scss";
import { useNavigate } from "react-router";
import Moment from "moment";

interface UserProfileCardType {
  CurentUserData: any;
}

const UserProfileCard = ({ CurentUserData }: UserProfileCardType) => {
  let createdAt = CurentUserData?.createdAt;
  var joinedDate = Moment(createdAt).format("MMM YYYY");
  const imgEl = React.useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = React.useState(false);
  const navigate = useNavigate();

  const onImageLoaded = () => setLoaded(true);

  useEffect(() => {
    const imgElCurrent = imgEl.current;

    if (imgElCurrent) {
      imgElCurrent.addEventListener("load", onImageLoaded);
      return () => imgElCurrent.removeEventListener("load", onImageLoaded);
    }
  }, [imgEl]);

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

  const handleUserClick = (e) => {
    navigate(`/${CurentUserData?._id}/myCreated`);
  };

  return (
    <Box className={Classes.bannerArea} onClick={handleUserClick}>
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
          <Typography component="div" className={Classes.bannerActionItem}>
            <FontAwesomeIcon
              icon={faShareNodes}
              className={Classes.icon}
              style={{ color: "#1D9BF0" }}
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
          className={`VisbyExtrabold userNameExplore ${Classes.userName}`}
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

export default UserProfileCard;
