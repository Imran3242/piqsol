import * as React from "react";
import {
  Button,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import PiqSolTokenLogo from "../../assets/images/piqsol-token.svg";
import Classes from "../../style/Common/Modal.module.scss";
import Styles from "../../style/PiqSolTokens/PiqSolTokensModal.module.scss";

import CloseIcon from "@mui/icons-material/Close";
import { useWallet } from "@solana/wallet-adapter-react";
import { getUserFormatedUserBalance } from "components/common/helpers/helpers";
import { useSelector } from "react-redux";

export default function PiqSolTokensModal(props: any) {
  const { triggerRichargeWalletModal, openModal, closeModal } = props;

  const userPQLBalance = useSelector(
    (state: any) => state.authReducer.currentPQLBalance
  );

  const rechargeWallet = () => {
    closeModal();
    triggerRichargeWalletModal();
  };
  return (
    <div className={Classes.modalWrapper}>
      <Dialog
        open={openModal}
        onClose={closeModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className={Classes.dialogWrapper}
        sx={{ width: "485px", margin: "auto" }}
      >
        <DialogTitle>
          <Typography className={Classes.modalHeader}>
            <Typography component="h4" className={Classes.modalTitle}>
              Piqsol Tokens
            </Typography>
            <CloseIcon onClick={closeModal} className={Classes.closeIcon} />
          </Typography>
        </DialogTitle>
        <DialogContent className={Styles.modalBodyWrapper}>
          <Typography className={Styles.piqSolLogo}>
            <img
              loading="lazy"
              className={Styles.piqSolLogoImg}
              src={PiqSolTokenLogo}
              alt="piqsol token logo"
            />
          </Typography>
          <Typography component="p" className={Styles.tokenCount}>
            {getUserFormatedUserBalance(userPQLBalance)}
          </Typography>
          <Typography component="p" className={Styles.description}>
            Piqsol tokens are required to pay platform fees. Please kindly
            recharge your wallet balance to fully enjoy the many benefits of the
            piqsol ecosystem.
          </Typography>
          <Typography component="div" className={Styles.actionWrapper}>
            <Button
              type="button"
              className={Styles.actionButton}
              onClick={rechargeWallet}
            >
              Recharge
            </Button>
          </Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
}
