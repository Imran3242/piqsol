import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import Header from '../components/common/Header'
const Footer = React.lazy(() => import("../components/common/Footer"));
const LeftBar = React.lazy(() => import("../components/common/LeftSideBar"));
import { useWallet } from "@solana/wallet-adapter-react";

import { Box } from "@mui/material";
import Classes from "style/Hoc/Hoc.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

import { makeStyles } from "@mui/styles";
import { useSelector } from "react-redux";
import { authSelector } from "store/reducers/authReducer";

const useStyles = makeStyles({
  root: {},
});

const Hoc = (props: any) => {
  const wallet = useWallet();
  const [open, setOpen] = React.useState(false);

  const { isAuth } = useSelector(authSelector).authReducer;

  const handleClose = () => {
    setOpen(false);
  };
  const handleToggle = () => {
    setOpen(!open);
  };

  const [showSidebarFromHeader, setShowSidebarFromHeader] =
    React.useState(false);

  const overRideStyles = useStyles();

  return (
    <>
      <Header setShowSidebarFromHeader={setShowSidebarFromHeader} />
      <Box className={`${Classes.mainContent} ${overRideStyles.root}`}>
        {isAuth && (
          <React.Suspense fallback={<div></div>}>
            <LeftBar
              showBackdrop={handleToggle}
              hideBackdrop={handleClose}
              closeSidebar={open}
              showSidebarFromHeader={showSidebarFromHeader}
              setShowSidebarFromHeader={setShowSidebarFromHeader}
            />
            {open && (
              <FontAwesomeIcon
                onClick={handleClose}
                icon={faXmark}
                className={Classes.closeIcon}
              />
            )}
          </React.Suspense>
        )}
        <Box className={`${wallet.connected && Classes.leftSpace}`}>
          {props.children}
        </Box>
      </Box>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
        onClick={handleClose}
      ></Backdrop>
      <React.Suspense fallback={<div></div>}>
        <Footer />
      </React.Suspense>
    </>
  );
};

export default Hoc;
