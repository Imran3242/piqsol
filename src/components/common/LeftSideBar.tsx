import * as React from "react";
import { styled, Theme, CSSObject } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import Tooltip from "@mui/material/Tooltip";
import UtilitiesMenu from "../../assets/icons/Utilities-Menu.png";

import { WalletModal } from "../walletAdapter";
import PiqSolTokensModal from "../PiqSolTokens/PiqSolTokensModal";
import RechargeWalletModal from "../PiqSolTokens/RechargeWalletModal";
import { useWallet } from "@solana/wallet-adapter-react";
import UserImg from "../../assets/images/leftBarColoredImages/user-colored.png";
import MyCreatedImg from "../../assets/images/leftBarColoredImages/my-created.png";
import Favorited from "../../assets/images/leftBarColoredImages/favorited.png";
import HistoryActivity from "../../assets/images/leftBarColoredImages/history-active.png";
import Settings from "../../assets/images/leftBarColoredImages/Settings.png";
import Staking from "../../assets/images/leftBarColoredImages/Staking.png";
import Classes from "../../style/home/LeftSideBar.module.scss";
import {
  Typography,
  ListItemText,
  ListItemIcon,
  ListItem,
  List,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import {
  logOut,
  setCurrentPQLBalance,
  setLogOut,
} from "../../store/reducers/authReducer";
import { setUserFavourite } from "../../store/reducers/favouriteReducer";
import StackImg from "../../assets/icons/stacking.png";
import DarkModeToggle from "../../components/common/DarkMode/DarkModeToggle";
import collectionsIcon from "../../assets/icons/collectionsIcon.png";
import collectionsColoredIcon from "../../assets/images/leftBarColoredImages/collectionsColoredIcon.png";

import { getUserBalance } from "../../utils/helpers/getUserBalance";
import {
  faUser,
  faPenRuler,
  faHeart,
  faClockRotateLeft,
  faGear,
  faCoins,
  faArrowRightFromBracket,
  faArrowsUpDown,
} from "@fortawesome/free-solid-svg-icons";
import { setNfts } from "store/reducers/nftReducer";
import { getUserFormatedUserBalance } from "./helpers/helpers";
import { setCollections } from "store/reducers/collectionReducer";

const drawerWidth = 290;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export interface SimpleDialogProps {
  open: boolean;
  selectedValue: boolean;
  onClose: (value: string) => void;
}

export default function LeftBar(props: any) {
  const {
    showBackdrop,
    hideBackdrop,
    closeSidebar,
    showSidebarFromHeader,
    setShowSidebarFromHeader,
  } = props;
  const isLogedIn = useSelector((state: any) => state.authReducer.isAuth);
  const wallet = useWallet();
  const navigate = useNavigate();

  const [open, setOpen] = React.useState(false);
  const [visible, setVisible] = React.useState<boolean>(false);
  const [openPiqSolModal, setOpenPiqSolModal] = React.useState(false);

  const currentUser = useSelector(
    (state: any) => state.authReducer.currentUser
  );

  const userPQLBalance = useSelector(
    (state: any) => state.authReducer.currentPQLBalance
  );
  const [openRechargeWalletModal, setOpenRechargeWalletModal] =
    React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(!open);
    showBackdrop();
  };

  const handleDrawerClose = () => {
    setOpen(false);
    hideBackdrop();
  };

  React.useEffect(() => {
    if (!closeSidebar) {
      handleDrawerClose();
    }
  }, [closeSidebar]);

  React.useEffect(() => {
    if (showSidebarFromHeader) {
      handleDrawerOpen();
      setShowSidebarFromHeader(false);
    }
  }, [showSidebarFromHeader]);

  const piqSolTokensModal = async () => {
    const { userPiqsolBalance: userPQLBalance }: any = await getUserBalance(
      currentUser?.chainType,
      wallet
    );
    dispatch(setCurrentPQLBalance(userPQLBalance));

    setOpenPiqSolModal(true);
  };
  const closePiqSolTokensModal = () => {
    setOpenPiqSolModal(false);
  };

  const rechargeWalletModal = () => {
    setOpenRechargeWalletModal(true);
  };
  const closeRechargeWalletModal = () => {
    setOpenRechargeWalletModal(false);
  };

  const dispatch = useDispatch();
  return (
    <>
      {currentUser && (
        <Drawer
          variant="permanent"
          open={open}
          className={
            open
              ? `${Classes.asideBar} ${Classes.showSidebar}`
              : Classes.asideBar
          }
        >
          <List>
            <ListItem className={Classes.listItem} onClick={handleDrawerOpen}>
              <Typography className={Classes.tabLink}>
                <ListItemIcon className={Classes.listItemIcon}>
                  <FontAwesomeIcon
                    icon={faArrowsUpDown}
                    style={{ transform: "rotate(50deg)", fontSize: "25px" }}
                  />
                </ListItemIcon>
                <ListItemText
                  className={`${Classes.tabText} ${Classes.toggleMenu}`}
                  primary="Toggle Menu"
                />
              </Typography>
            </ListItem>

            <ListItem className={Classes.listItem} onClick={handleDrawerClose}>
              <NavLink
                to={`/${currentUser?.id}/myCollected`}
                className={({ isActive }) =>
                  isActive
                    ? `${Classes.activeClassLink} ${Classes.tabLink}`
                    : `${Classes.tabLink}`
                }
              >
                <ListItemIcon className={Classes.listItemIcon}>
                  <FontAwesomeIcon icon={faUser} className={Classes.userIcon} />
                  <img
                    loading="lazy"
                    src={UserImg}
                    alt="ColoredImg"
                    className={Classes.activeImgIcon}
                  />
                </ListItemIcon>
                <ListItemText
                  className={Classes.tabText}
                  primary="My Profile"
                />
              </NavLink>
            </ListItem>

            <ListItem className={Classes.listItem} onClick={handleDrawerClose}>
              <NavLink
                to={`/${currentUser?.id}/myCreated`}
                className={({ isActive }) =>
                  isActive
                    ? `${Classes.activeClassLink} ${Classes.tabLink}`
                    : `${Classes.tabLink}`
                }
              >
                <ListItemIcon className={Classes.listItemIcon}>
                  <FontAwesomeIcon
                    icon={faPenRuler}
                    className={Classes.userIcon}
                    fontSize={"19px"}
                  />
                  <img
                    loading="lazy"
                    src={MyCreatedImg}
                    alt="MyCreated Colored"
                    className={Classes.activeImgIcon}
                  />
                </ListItemIcon>
                <ListItemText
                  className={Classes.tabText}
                  primary="My Created"
                />
              </NavLink>
            </ListItem>

            <ListItem className={Classes.listItem} onClick={handleDrawerClose}>
              <NavLink
                to={`/${currentUser?.id}/myFavorited`}
                className={({ isActive }) =>
                  isActive
                    ? `${Classes.activeClassLink} ${Classes.tabLink}`
                    : `${Classes.tabLink}`
                }
              >
                <ListItemIcon className={Classes.listItemIcon}>
                  <FontAwesomeIcon
                    icon={faHeart}
                    className={Classes.userIcon}
                  />
                  <img
                    loading="lazy"
                    src={Favorited}
                    alt="Favorited Colored"
                    className={Classes.activeImgIcon}
                  />
                </ListItemIcon>
                <ListItemText
                  className={Classes.tabText}
                  primary="My Favorites"
                />
              </NavLink>
            </ListItem>

            <ListItem className={Classes.listItem} onClick={handleDrawerClose}>
              <NavLink
                to={`/${currentUser?.id}/myActivity`}
                className={({ isActive }) =>
                  isActive
                    ? `${Classes.activeClassLink} ${Classes.tabLink}`
                    : `${Classes.tabLink}`
                }
              >
                <ListItemIcon className={Classes.listItemIcon}>
                  <FontAwesomeIcon
                    icon={faClockRotateLeft}
                    className={Classes.userIcon}
                  />
                  <img
                    loading="lazy"
                    src={HistoryActivity}
                    alt="History Activity Colored"
                    className={Classes.activeImgIcon}
                  />
                </ListItemIcon>
                <ListItemText
                  className={Classes.tabText}
                  primary="My Activity"
                />
              </NavLink>
            </ListItem>

            <ListItem className={Classes.listItem} onClick={handleDrawerClose}>
              <NavLink
                to="/collections"
                className={({ isActive }) =>
                  isActive
                    ? `${Classes.activeClassLink} ${Classes.tabLink}`
                    : `${Classes.tabLink}`
                }
              >
                <ListItemIcon className={Classes.listItemIcon}>
                  <img
                    loading="lazy"
                    src={collectionsIcon}
                    alt="collections Icon"
                    className={Classes.userIcon}
                    style={{ width: "20px" }}
                  />
                  <img
                    loading="lazy"
                    src={collectionsColoredIcon}
                    alt="collections Icon Colored"
                    className={Classes.activeImgIcon}
                    style={{ width: "22px" }}
                  />
                </ListItemIcon>
                <ListItemText
                  className={Classes.tabText}
                  primary="Collections"
                />
              </NavLink>
            </ListItem>

            <Tooltip title="Coming Soon">
              <ListItem
                className={Classes.listItem}
                onClick={handleDrawerClose}
              >
                <NavLink
                  to="/staking"
                  className={({ isActive }) =>
                    isActive
                      ? `${Classes.activeClassLink} ${Classes.tabLink}`
                      : `${Classes.tabLink}`
                  }
                >
                  <ListItemIcon className={Classes.listItemIcon}>
                    <img
                      loading="lazy"
                      src={StackImg}
                      alt="StackImg"
                      className={Classes.userIcon}
                      style={{ height: "20px", width: "20px" }}
                    />
                    <img
                      loading="lazy"
                      src={Staking}
                      alt="Staking Colored"
                      className={Classes.activeImgIcon}
                    />
                  </ListItemIcon>
                  <ListItemText className={Classes.tabText} primary="Staking" />
                </NavLink>
              </ListItem>
            </Tooltip>

            <ListItem className={Classes.listItem} onClick={handleDrawerClose}>
              <Typography
                onClick={() => setVisible(true)}
                component="div"
                className={Classes.tabLink}
              >
                <ListItemIcon className={Classes.listItemIcon}>
                  <img
                    loading="lazy"
                    src={UtilitiesMenu}
                    width="25"
                    alt="UtilitiesMenu icon"
                  />
                </ListItemIcon>
                <div className={Classes.tabText}>
                  <span>Wallet</span>
                  <span className={Classes.tabConnected}>Connected</span>
                </div>
              </Typography>
            </ListItem>

            <ListItem className={Classes.listItem} onClick={handleDrawerClose}>
              <Typography
                component="div"
                className={Classes.tabLink}
                onClick={piqSolTokensModal}
              >
                <ListItemIcon className={Classes.listItemIcon}>
                  <FontAwesomeIcon icon={faCoins} />
                </ListItemIcon>
                <Typography component="div">
                  <ListItemText
                    className={Classes.tabText}
                    primary="Piqsol Tokens"
                  />
                  <ListItemText
                    className={`VisbyBold ${Classes.tabTextBlue}`}
                    primary={`(${getUserFormatedUserBalance(userPQLBalance)})`}
                  />
                </Typography>
              </Typography>
            </ListItem>

            <ListItem className={Classes.listItem}>
              <DarkModeToggle sidebarToggle={true} />
            </ListItem>

            <ListItem className={Classes.listItem} onClick={handleDrawerClose}>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  isActive
                    ? `${Classes.activeClassLink} ${Classes.tabLink}`
                    : `${Classes.tabLink}`
                }
              >
                <ListItemIcon className={Classes.listItemIcon}>
                  <FontAwesomeIcon icon={faGear} className={Classes.userIcon} />
                  <img
                    loading="lazy"
                    src={Settings}
                    alt="Settings Colored"
                    className={Classes.activeImgIcon}
                  />
                </ListItemIcon>
                <ListItemText className={Classes.tabText} primary="Settings" />
              </NavLink>
            </ListItem>

            <ListItem
              button
              disabled={!isLogedIn}
              className={Classes.listItem}
              onClick={handleDrawerClose}
            >
              <Typography
                component="div"
                className={Classes.tabLink}
                onClick={async () => {
                  const response: any = await dispatch(logOut());
                  if (response?.success) {
                    await wallet.disconnect();
                    dispatch(setLogOut());
                    dispatch(setUserFavourite([]));
                    dispatch(setNfts([]));
                    dispatch(setCollections([]));

                    navigate("/");
                  }
                }}
              >
                <ListItemIcon className={Classes.listItemIcon}>
                  <FontAwesomeIcon icon={faArrowRightFromBracket} />
                </ListItemIcon>
                <ListItemText className={Classes.tabText} primary="Log out" />
              </Typography>
            </ListItem>
          </List>
        </Drawer>
      )}

      <WalletModal isVisible={visible} onClose={() => setVisible(false)} />

      <PiqSolTokensModal
        openModal={openPiqSolModal}
        closeModal={closePiqSolTokensModal}
        triggerRichargeWalletModal={rechargeWalletModal}
      />
      <RechargeWalletModal
        setOpenRechargeWalletModal={setOpenRechargeWalletModal}
        openModal={openRechargeWalletModal}
        closeModal={closeRechargeWalletModal}
      />
    </>
  );
}
