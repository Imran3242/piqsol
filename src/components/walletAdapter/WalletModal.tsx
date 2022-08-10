import { WalletName } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { FC, MouseEvent, useCallback, useRef } from "react";
import { WalletIcon } from "./WalletIcon";
import { loginWithMetaMask } from "../../web3/web3";

import metaMask from "../../../src/assets/images/metamask.png";
import CloseIcon from "@mui/icons-material/Close";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import styles from "../../style/home/LeftSideBar.module.scss";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Dialog from "@mui/material/Dialog";
import { useDispatch, useSelector } from "react-redux";
import { authSelector, login } from "store/reducers/authReducer";

import {
  setIsOpen,
  setIsSuccess,
  setMessage,
} from "store/reducers/errorSuccessMessageReducer";

export interface WalletModalProps {
  isVisible: boolean;
  onClose: (value: boolean) => void;
}

export const WalletModal: FC<WalletModalProps> = ({ isVisible, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { wallets, select, disconnect } = useWallet();
  const dispatch = useDispatch();

  const states = useSelector(authSelector).authReducer;

  const hideModal = useCallback(() => {
    setTimeout(() => onClose(false), 150);
  }, []);

  const handleClose = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      hideModal();
    },
    [hideModal]
  );

  const handleWalletClick = (event: MouseEvent, walletName: WalletName) => {
    select(walletName);
    handleClose(event);
  };

  const handleMetaMaskWalletClick = async (
    event,
    selectedBlockChainType: string
  ) => {
    await disconnect();

    const signResponse: any = await loginWithMetaMask(selectedBlockChainType);

    console.log("signResponse =====", signResponse);
    if (signResponse === -1) {
      dispatch(
        setMessage(
          "You're not allowed to login untill you switch the network of your wallet which is associated with your account"
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
      return;
    }

    if (signResponse === -2) {
      dispatch(
        setMessage(
          "Please sign the nonce for authentication, to proceed the login"
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
      return;
    }

    const loggedInUser = await dispatch(
      login(
        signResponse?.walletAddress,
        signResponse?.signature,
        selectedBlockChainType
      )
    );

    if (!loggedInUser) {
      //User Not switched the wallet
      dispatch(
        setMessage(
          "You're not allowed to login untill you switch the network of your wallet which is associated with your account"
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
    }

    hideModal();
  };

  return (
    <Dialog open={isVisible || false} onClose={onClose}>
      <Box sx={{ borderRadius: "15px", p: "30px 20px", position: "relative" }}>
        <CloseIcon
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: "30px",
            top: "30px",
            opacity: 0.45,
            cursor: "pointer",
            color: "var(--text-color)",
          }}
        />
        <DialogTitle className={styles.heading}>
          {states?.isAuth ? "Swap your Wallet" : "Connect your wallet"}
        </DialogTitle>
        {states?.isAuth ? (
          <>
            <Typography className={styles.description}>
              Piqsol is multichain platform. You need to swap your wallet or
              create a new wallet to get started. Please select a wallet that
              supports your buy, sell or mint requirements. eg. Phantom for
              Solana or metamask for BSC, Polygon.
            </Typography>
            <br></br>
            <Typography className={styles.extraDescription}>
              Kindly choose from the options below:
            </Typography>
          </>
        ) : (
          <>
            <Typography className={styles.description}>
              Piqsol is multichain platform and will require you to create a new
              wallet or login with the wallet that supports your buy, sell or
              mint requirements. eg. Phantom for Solana or metamask for BSC,
              Polygon.
            </Typography>
            <br></br>
            <Typography className={styles.extraDescription}>
              Kindly choose from the options below:
            </Typography>
          </>
        )}
        <Box className={styles.list}>
          {wallets.map((wallet, index) => (
            <Box key={index}>
              <Box
                onClick={(event) =>
                  handleWalletClick(event, wallet.adapter.name)
                }
                className={styles.mainAvatar}
                key={index}
              >
                <Avatar className={styles.avatar} key={index}>
                  <WalletIcon wallet={wallet} key={index} />
                </Avatar>
                <Typography key={index} className={styles.name}>
                  {wallet.adapter.name}
                </Typography>
              </Box>
            </Box>
          ))}
          <Box>
            <Box
              onClick={(event) => handleMetaMaskWalletClick(event, "polygon")}
              className={styles.mainAvatar}
            >
              <Avatar className={styles.avatar}>
                <img loading="lazy" src={metaMask} />
              </Avatar>
              <Typography className={styles.name}>
                MetaMask (Polygon)
              </Typography>
            </Box>
          </Box>
          <Box>
            <Box
              onClick={(event) => handleMetaMaskWalletClick(event, "binance")}
              className={styles.mainAvatar}
            >
              <Avatar className={styles.avatar}>
                <img loading="lazy" src={metaMask} />
              </Avatar>
              <Typography className={styles.name}>
                MetaMask (Binance)
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};
