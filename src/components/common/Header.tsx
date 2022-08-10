import React, { useEffect } from "react";
import { styled, alpha } from "@mui/material/styles";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  Menu,
  MenuItem,
  Avatar,
  Button,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";

import user from "../../assets/icons/user.png";
import interfaceUser from "../../assets/icons/interface-user.png";
import io from "socket.io-client";
import { WalletModal } from "../walletAdapter";
import { storeMyCollected } from "../../store/reducers/nftReducer";
import Logo from "../../assets/images/Logo.png";
import { Link, useLocation } from "react-router-dom";
import Classes from "../../style/home/Header.module.scss";
import DarkModeToggle from "../common/DarkMode/DarkModeToggle";
import { getUserBalance } from "utils/helpers/getUserBalance";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsUpDown } from "@fortawesome/free-solid-svg-icons";
import { faBell, faMessage } from "@fortawesome/free-regular-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import {
  login,
  authSelector,
  setCurrentPQLBalance,
  getUserProfile,
  setCurrentEthBalance,
} from "../../store/reducers/authReducer";

import SearchIcon from "../../assets/icons/SVG/SearchIcon";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
  getUserAllNotification,
  updateNotification,
} from "store/reducers/notificatonReducer";
import { getUserFavouriteNft } from "store/reducers/favouriteReducer";
import { getSystemSettings } from "store/reducers/systemSettingReducer";
import {
  getIsReadMessageCount,
  setLatestMessage,
} from "store/reducers/messageReducer";
import {
  getChainNameByChainId,
  getConvertedDateTime,
  getNotificationTitleAndDescription,
  getSpecialCharacterReplaced,
  getUnreadNotification,
} from "./helpers/helpers";
import {
  setSearchedText,
  setProfileSearchTextOnFocus,
  setSearchTextOnFocus,
} from "store/reducers/searchReducer";
import SearchItem from "./SearchItem";
import { getSomeSearchResults } from "store/reducers/auctionReducer";
import { getAccountInformation, getNonceString, getWeb3 } from "web3/web3";
import {
  setIsOpen,
  setIsSuccess,
  setMessage,
} from "store/reducers/errorSuccessMessageReducer";

const pages = [
  {
    id: 1,
    pageName: "Explore",
    to: "/explore",
  },
  {
    id: 2,
    pageName: "Ranking",
    to: "/ranking",
  },
  {
    id: 3,
    pageName: "Resources",
    to: "/resources",
  },
];

const mobilePages = [
  {
    id: 1,
    pageName: "Explore",
    to: "/explore",
  },
  {
    id: 2,
    pageName: "Ranking",
    to: "/ranking",
  },
  {
    id: 3,
    pageName: "Resources",
    to: "/resources",
  },
];

var socket: any;
const ENDPOINT: any = process.env.REACT_APP_BASE_URL; //"http://localhost:5000/";

const Header = (props: any) => {
  const location = useLocation();
  const authUser: any = JSON.parse(localStorage.getItem("authUser") || "{}");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const states = useSelector(authSelector).authReducer;
  const wallet = useWallet();
  const dropDownSearchRef = React.useRef(null);
  const [notifications, setNotificatoins] = React.useState<any>([]);
  const publicKey = wallet.publicKey?.toBase58() ?? "";
  const currentUser = useSelector(
    (state: any) => state.authReducer.currentUser
  );
  const { setShowSidebarFromHeader } = props;
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );

  const newMessageArrived = useSelector(
    (state: any) => state.messageReducer.latestMassage
  );

  const [socketConnected, setSocketConnected] = React.useState(false);

  const searchTextOnFocus = useSelector(
    (state: any) => state?.searchReducer?.searchTextOnFocus
  );

  const [anchorNotivicatoinElNav, setAnchorNotivicatoinElNav] =
    React.useState<null | HTMLElement>(null);

  const [visible, setVisible] = React.useState<boolean>(false);

  const [searchValue, setSearchValue] = React.useState<string>(undefined);
  const [activeTab, setActiveTab] = React.useState<string>("");

  const [collections, setCollections] = React.useState<Array<any>>([]);
  const [nfts, setNfts] = React.useState<Array<any>>([]);
  const [users, setUsers] = React.useState<Array<any>>([]);
  const [alertMessage, setAlertMessage] = React.useState<any>({
    open: false,
    type: "success",
    message: "",
  });
  const [showDropDown, setShowDropDown] = React.useState<boolean>(false);

  const unreadMessage = useSelector(
    (state: any) => state.messageReducer.unReadMessages
  );

  const handleLoginUsingEthereumChains = async () => {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    const chainId = await web3.eth.getChainId();

    const authUser: any = localStorage.getItem("authUser") || undefined;

    if (!publicKey && !wallet.connected && accounts.length > 0 && authUser) {
      const loginResponse: any = await dispatch(
        login(accounts[0], undefined, getChainNameByChainId(chainId))
      );

      if (!loginResponse) {
        dispatch(setMessage("User is blocked by admin."));
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));

        return false;
      }

      if (loginResponse?.token) {
        const accountInformation = await getAccountInformation(
          loginResponse?.user?.chainType,
          loginResponse?.user?.walletAddress
        );
        dispatch(setCurrentEthBalance(accountInformation?.balance));
        await dispatch(getUserProfile());
        return true;
      }
      return false;
    }
  };

  useEffect(() => {
    const listener = (event) => {
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        event.preventDefault();
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, []);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", currentUser);
    socket.on("connected", () => setSocketConnected(true));
  }, []);

  useEffect(() => {
    dispatch(getIsReadMessageCount());
  }, [newMessageArrived?._id]);

  useEffect(() => {
    socket.on("message recieved", async (newMessageRecieved: any) => {
      dispatch(setLatestMessage(newMessageRecieved));
    });
  });

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenSearch = (event: React.MouseEvent<HTMLElement>) => {
    dispatch(setProfileSearchTextOnFocus(false));
    dispatch(setSearchTextOnFocus(true));
  };

  const handleCloseNavMenu = (page: string) => {
    setActiveTab(page);
    setAnchorElNav(null);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const alertHandleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertMessage(false);
  };
  const handleLogin = async () => {
    const userNonce = await getNonceString(publicKey, "solana");
    const message = `I am signing my one-time nonce for Piqsol: ${userNonce.nonceValue}`;
    const data = new TextEncoder().encode(message);
    const signature = await wallet.signMessage(data); // Uint8Array
    const signatureBase64 = Buffer.from(signature).toString("base64");

    console.log("signature ====", signatureBase64);
    if (publicKey && wallet.connected) {
      const result = await dispatch(
        login(publicKey, signatureBase64, "solana")
      );

      console.log("result ====", result);

      if (!result) {
        dispatch(setMessage("User is blocked by admin."));
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));

        wallet.disconnect();
        return;
      }

      const { userPiqsolBalance: balance } = await getUserBalance(
        currentUser?.chainType,
        wallet
      );
      dispatch(setCurrentPQLBalance(balance));
      await dispatch(getUserProfile());

      return;
    }
  };

  const getUserNotification = async () => {
    const unseenNotifications = await dispatch(getUserAllNotification());
    setNotificatoins(unseenNotifications);
  };

  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (
        dropDownSearchRef.current &&
        !dropDownSearchRef.current.contains(event.target)
      ) {
        setShowDropDown(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropDownSearchRef]);

  useEffect(() => {
    if (states?.token) {
      getUserNotification();
      dispatch(getUserFavouriteNft(currentUser.id));
      dispatch(getIsReadMessageCount());
      dispatch(getSystemSettings());
    }
  }, [states?.token]);

  useEffect(() => {
    console.log("wallet =====", wallet);
    if (wallet.connected) {
      handleLogin();
    }
  }, [wallet.connected]);

  const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(3),
      width: "auto",
    },
  }));

  const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }));

  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: "inherit",
    "& .MuiInputBase-input": {
      padding: theme.spacing(1, 1, 1, 0),
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create("width"),
      width: "100%",
      [theme.breakpoints.up("md")]: {
        width: "20ch",
      },
    },
  }));

  const loginAndProfileDetailAction = () => {
    if (states.isAuth) {
      dispatch(storeMyCollected());
      navigate(`/${currentUser?.id}/myCollected`);
    } else {
      setVisible(true);
    }
  };

  const handleNotificatoinClick = async (notification: any) => {
    setAnchorEl(null);
    await dispatch(
      updateNotification(notification?._id, { ...notification, isSeen: true })
    );

    const updatedNotifications = await dispatch(getUserAllNotification());
    setNotificatoins(updatedNotifications);
    if (notification?.type === "staked") {
      navigate("/staking");
      return;
    }
    navigate(`/explore/explore-details/${notification?.nftId}`, {
      state: notification,
    });
  };

  const handleSearch = () => {
    if (searchValue?.length > 0) {
      dispatch(setSearchedText(searchValue.trim()));
      setShowDropDown(false);
      navigate("/explore");
    }
  };

  const handleSearchTextChange = async (event) => {
    if (event.target.value.length >= 1) {
      setShowDropDown(true);
    }
    if (!event.target.value || event.target.value === "") {
      setSearchValue(undefined);
      dispatch(setSearchedText(undefined));
      setShowDropDown(false);
    }
    if (event.target.value && event.target.value !== "") {
      const searchedFilteredValue = event.target.value.replace(
        /[^a-zA-Z0-9 #]/g,
        ""
      );
      setSearchValue(searchedFilteredValue);
    }
  };

  const getSearchedResultOnTyping = async () => {
    setShowDropDown(true);
    const data: any = await dispatch(
      getSomeSearchResults(getSpecialCharacterReplaced(searchValue.trim()))
    );
    setCollections(data?.collections);
    setUsers(data?.users);
    setNfts(data?.nfts);
  };

  useEffect(() => {
    if (searchValue && searchValue !== "") {
      getSearchedResultOnTyping();
    }
    if (!searchValue) {
      setShowDropDown(false);
    }
  }, [searchValue]);

  return (
    <AppBar className={Classes.header} position="sticky">
      <Toolbar disableGutters>
        <Box
          component="div"
          sx={{
            pr: 4,
            flexGrow: { xs: 1, lg: 0 },
            display: { xs: "none", md: "flex" },
          }}
        >
          <Link to="/" style={{ textDecoration: "none" }}>
            {states.isAuth ? (
              <img
                loading="lazy"
                src={Logo}
                alt="logo"
                className={Classes.logo}
              />
            ) : (
              <Typography
                component="div"
                className={Classes.logoOutLogo}
              ></Typography>
            )}
          </Link>
        </Box>

        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            color: "#000",
          }}
        >
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            color="inherit"
          >
            <MenuIcon style={{ color: "#868686" }} />
          </IconButton>

          <IconButton onClick={() => setShowSidebarFromHeader(true)}>
            <FontAwesomeIcon
              icon={faArrowsUpDown}
              style={{
                transform: "rotate(50deg)",
                fontSize: "25px",
                color: "#868686",
              }}
            />
          </IconButton>

          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            open={Boolean(anchorElNav)}
            onClose={() => handleCloseNavMenu("")}
            sx={{
              display: { xs: "block", md: "none", color: "#000" },
            }}
            className="VisbyBold"
          >
            {mobilePages.map((page) => (
              <Link
                key={page.id}
                to={page.to}
                className={Classes.linkDecoration}
              >
                <MenuItem onClick={() => handleCloseNavMenu("")}>
                  <Typography textAlign="center">{page.pageName}</Typography>
                </MenuItem>
              </Link>
            ))}
          </Menu>
        </Box>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            justifyContent: "center",
            display: { xs: "flex", md: "none" },
          }}
        >
          <Link to="/">
            <img
              loading="lazy"
              src={Logo}
              alt="logo"
              className={Classes.logo}
            />
          </Link>
        </Typography>

        <Box
          sx={{
            flexGrow: 1,
            display: { xs: "none", lg: "block" },
          }}
          ref={dropDownSearchRef}
          className={Classes.liveSearchRelative}
        >
          <Search className={Classes.headerSearch}>
            <SearchIconWrapper>
              <SearchIcon className={Classes.searchIconColor} />
            </SearchIconWrapper>
            <StyledInputBase
              sx={{
                flexGrow: 1,
                "& .MuiInputBase-input": { flexGrow: 1 },
                fontFamily: "Visby CF Demi Bold",
              }}
              placeholder="Search creator, collection or asset"
              inputProps={{ "aria-label": "search" }}
              type="text"
              value={searchValue}
              onClick={handleOpenSearch}
              autoFocus={searchTextOnFocus}
              defaultValue={undefined}
              onChange={(e) => handleSearchTextChange(e)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {searchValue && (
              <CloseOutlinedIcon
                className={Classes.searchCancel}
                onClick={() => {
                  setSearchValue(undefined);
                  dispatch(setSearchedText(undefined));
                  dispatch(setSearchTextOnFocus(false));
                  dispatch(setProfileSearchTextOnFocus(false));
                }}
              />
            )}
          </Search>

          {showDropDown && (
            <List className={Classes.liveSearch}>
              {collections.length > 0 && (
                <>
                  <ListItem>
                    <ListItemText
                      className={Classes.searchTitle}
                      secondary="Collections"
                    />
                  </ListItem>
                  {collections?.map((collection) => (
                    <SearchItem
                      item={collection}
                      type="collections"
                      handleClose={setShowDropDown}
                      searchedText={searchValue}
                    />
                  ))}
                </>
              )}

              {users.length > 0 && (
                <>
                  <ListItem>
                    <ListItemText
                      className={Classes.searchTitle}
                      secondary="Users"
                    />
                  </ListItem>
                  {users?.map((user) => (
                    <SearchItem
                      item={user}
                      type="users"
                      handleClose={setShowDropDown}
                      searchedText={searchValue}
                    />
                  ))}
                </>
              )}

              {nfts.length > 0 && (
                <>
                  <ListItem>
                    <ListItemText
                      className={Classes.searchTitle}
                      secondary="NFTs"
                    />
                  </ListItem>
                  {nfts?.map((nft) => (
                    <SearchItem
                      item={nft}
                      type="nfts"
                      handleClose={setShowDropDown}
                      searchedText={searchValue}
                    />
                  ))}
                </>
              )}
              <ListItem>
                <ListItemText
                  className={Classes.infoText}
                  secondary={
                    collections.length === 0 &&
                    nfts.length === 0 &&
                    users.length === 0
                      ? "No results found"
                      : "Press enter to get complete results"
                  }
                />
              </ListItem>
            </List>
          )}

          {/* </Popover> */}
        </Box>

        <Box
          className="headerMenu"
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          {pages.map((page) => (
            <Link key={page.id} to={page.to} className={Classes.linkDecoration}>
              <Button
                onClick={() => handleCloseNavMenu(page.to)}
                className={`${
                  location.pathname === page.to && Classes.activeMenuButton
                } ${Classes.menuButton}`}
                sx={{ my: 2 }}
              >
                {page.pageName}
              </Button>
            </Link>
          ))}
        </Box>

        {!states?.isAuth && <DarkModeToggle headerToggle={true} />}

        <Box sx={{ display: { xs: "none", md: "flex" } }}>
          <Link to="/create-collection" className={Classes.linkDecoration}>
            <Button
              className={Classes.createButton}
              variant="outlined"
              startIcon={<AddIcon />}
            >
              Create
            </Button>
          </Link>
        </Box>

        {states?.isAuth && (
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <Link to="/messenger" className={Classes.linkDecoration}>
              <IconButton
                sx={{ border: "2px solid #d5d5d5" }}
                className={Classes.iconButton}
                size="large"
                aria-label="show 4 new mails"
                color="inherit"
              >
                <Badge
                  className={Classes.headerBadge}
                  badgeContent={unreadMessage ? "" : undefined}
                  color={unreadMessage ? "error" : undefined}
                >
                  <FontAwesomeIcon icon={faMessage} />
                </Badge>
              </IconButton>
            </Link>

            <IconButton
              aria-controls={
                Boolean(anchorNotivicatoinElNav) ? "basic-menu" : undefined
              }
              aria-haspopup="true"
              aria-expanded={
                Boolean(anchorNotivicatoinElNav) ? "true" : undefined
              }
              sx={{ border: "2px solid #d5d5d5" }}
              className={Classes.iconButton}
              size="large"
              aria-label="show 17 new notifications"
              color="inherit"
              onClick={handleMenu}
            >
              <Badge
                className={Classes.headerBadge}
                badgeContent={
                  getUnreadNotification(notifications).length > 0
                    ? ""
                    : undefined
                }
                color={
                  getUnreadNotification(notifications).length > 0
                    ? "error"
                    : undefined
                }
              >
                <FontAwesomeIcon icon={faBell} />
              </Badge>
            </IconButton>
            <Popover
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              sx={{ marginTop: "5px" }}
            >
              <Box className={Classes.notificationPopup}>
                {notifications.length > 0 ? (
                  notifications.map((notification: any) => {
                    const notificationDetails: any =
                      getNotificationTitleAndDescription(notification);
                    const dateAndTime = getConvertedDateTime(
                      new Date(notification.createdAt).toString()
                    );
                    return (
                      <Box
                        className={
                          !notification.isSeen ? Classes.unread : Classes.read
                        }
                        onClick={() => handleNotificatoinClick(notification)}
                      >
                        <Typography className={Classes.heading} variant="h6">
                          {notificationDetails?.title}
                        </Typography>
                        <Typography className={Classes.description}>
                          {notificationDetails?.description}
                        </Typography>
                        <Typography className={Classes.dateTime}>
                          {`${dateAndTime.date}, ${dateAndTime.time}`}
                        </Typography>
                      </Box>
                    );
                  })
                ) : (
                  <Typography className={Classes.description}>
                    No notification found
                  </Typography>
                )}
              </Box>
            </Popover>
          </Box>
        )}

        <Box sx={{ flexGrow: 0 }}>
          {states?.isAuth ? (
            <IconButton sx={{ p: 0 }} onClick={loginAndProfileDetailAction}>
              {/* <Link to="/profile/details" className={Classes.linkDecoration}> */}
              <Avatar alt="Remy Sharp" src={currentUser?.avatar || user} />
              {/* </Link> */}
            </IconButton>
          ) : (
            <IconButton
              sx={{ background: "#eeeeee" }}
              className={Classes.iconButton}
              size="large"
              onClick={loginAndProfileDetailAction}
            >
              <Avatar alt="Remy Sharp" src={interfaceUser} />
            </IconButton>
          )}
        </Box>
      </Toolbar>
      <WalletModal isVisible={visible} onClose={() => setVisible(false)} />
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={alertMessage.open}
        autoHideDuration={6000}
        onClose={alertHandleClose}
      >
        <Alert
          onClose={alertHandleClose}
          severity={alertMessage.type}
          sx={{ width: "100%" }}
        >
          {alertMessage.message}
        </Alert>
      </Snackbar>
    </AppBar>
  );
};
export default Header;
