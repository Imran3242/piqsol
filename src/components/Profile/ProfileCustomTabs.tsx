import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faPenRuler,
  faHeart,
  faClockRotateLeft,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import Classes from "../../style/Common/CustomTabs.module.scss";
import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetails } from "store/reducers/userReducer";

const ProfileCustomTabs = ({ isOwner }: { isOwner: boolean }) => {
  const params = useParams();
  const dispatch = useDispatch();
  const [userData, setUserData] = useState<any>({});
  const fetchAndUpdateUserData = async () => {
    const userData: any = await dispatch(fetchUserDetails(params?.id));
    setUserData({ ...userData, id: userData?._id });
  };

  React.useEffect(() => {
    fetchAndUpdateUserData();
  }, [params?.id]);

  React.useEffect(() => {
    fetchAndUpdateUserData();
  }, []);

  const currentUser = useSelector(
    (state: any) => state?.authReducer?.currentUser
  );

  return (
    <Box component="div" className={Classes.customTabsWrapper}>
      {isOwner && (
        <NavLink
          to={`/${params?.id}/myCollected`}
          className={({ isActive }) =>
            isActive
              ? `${Classes.activeClassLink} ${Classes.tabLink}`
              : `${Classes.tabLink}`
          }
        >
          <Typography component="div" className={Classes.tabItem}>
            <FontAwesomeIcon icon={faBoxOpen} className={Classes.tabIcon} />{" "}
            <Typography component="span" className={Classes.tabName}>
              My NFTs <span>{currentUser?.nftCount}</span>
            </Typography>
          </Typography>
          <span className={Classes.borderBottom}></span>
        </NavLink>
      )}
      <NavLink
        to={`/${params?.id}/myCreated`}
        className={({ isActive }) =>
          isActive
            ? `${Classes.activeClassLink} ${Classes.tabLink}`
            : `${Classes.tabLink}`
        }
      >
        <Typography component="div" className={Classes.tabItem}>
          <FontAwesomeIcon icon={faPenRuler} className={Classes.tabIcon} />{" "}
          <Typography component="span" className={Classes.tabName}>
            My Collections{" "}
            <span>
              {userData?.id === currentUser?.id
                ? currentUser?.collectionCount
                : userData?.collectionCount}
            </span>
          </Typography>
        </Typography>
        <span className={Classes.borderBottom}></span>
      </NavLink>
      {isOwner && (
        <NavLink
          to={`/${params?.id}/myFavorited`}
          className={({ isActive }) =>
            isActive
              ? `${Classes.activeClassLink} ${Classes.tabLink}`
              : `${Classes.tabLink}`
          }
        >
          <Typography component="div" className={Classes.tabItem}>
            <FontAwesomeIcon icon={faHeart} className={Classes.tabIcon} />{" "}
            <Typography component="span" className={Classes.tabName}>
              My Favorites <span>{currentUser?.favouriteCount}</span>
            </Typography>
          </Typography>
          <span className={Classes.borderBottom}></span>
        </NavLink>
      )}

      {isOwner && (
        <NavLink
          to={`/${params?.id}/myActivity`}
          className={({ isActive }) =>
            isActive
              ? `${Classes.activeClassLink} ${Classes.tabLink}`
              : `${Classes.tabLink}`
          }
        >
          <Typography component="div" className={Classes.tabItem}>
            <FontAwesomeIcon
              icon={faClockRotateLeft}
              className={Classes.tabIcon}
            />{" "}
            <Typography component="span" className={Classes.tabName}>
              My Activity
            </Typography>
          </Typography>
          <span className={Classes.borderBottom}></span>
        </NavLink>
      )}
      {isOwner && (
        <NavLink
          to={`/${params?.id}/myWallet`}
          className={({ isActive }) =>
            isActive
              ? `${Classes.activeClassLink} ${Classes.tabLink}`
              : `${Classes.tabLink}`
          }
        >
          <Typography component="div" className={Classes.tabItem}>
            <FontAwesomeIcon icon={faWallet} className={Classes.tabIcon} />{" "}
            <Typography component="span" className={Classes.tabName}>
              My Wallet{" "}
            </Typography>
          </Typography>
          <span className={Classes.borderBottom}></span>
        </NavLink>
      )}
    </Box>
  );
};

export default ProfileCustomTabs;
