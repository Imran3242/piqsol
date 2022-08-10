import * as React from "react";
import {
  Button,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import Classes from "../../style/Common/Modal.module.scss";
import Styles from "../../style/Common/ErrorSuccessMessage.module.scss";

import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { setIsOpen } from "store/reducers/errorSuccessMessageReducer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

export default function ErrorSuccessMessage(props: any) {
  const dispatch = useDispatch();
  const openModal = useSelector(
    (state: any) => state.errorSuccessMessageReducer?.isOpen
  );

  const message = useSelector(
    (state: any) => state.errorSuccessMessageReducer?.message
  );
  const isSuccess = useSelector(
    (state: any) => state.errorSuccessMessageReducer?.isSuccess
  );

  const closeModal = () => {
    dispatch(setIsOpen(false));
  };

  return (
    <Dialog
      open={openModal}
      onClose={closeModal}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      className={Classes.dialogWrapper}
    >
      <DialogTitle>
        <Typography className={Classes.modalHeader}>
          <Typography component="h4" className={Classes.modalTitle}>
            <span>
              <FontAwesomeIcon
                icon={isSuccess ? faCheck : faExclamationTriangle}
                className={isSuccess ? "color-green" : "color-red"}
                style={{ width: "30px" }}
              />
            </span>
            {isSuccess ? "  Success" : "  Failed"}
          </Typography>
          <CloseIcon onClick={closeModal} className={Classes.closeIcon} />
        </Typography>
      </DialogTitle>
      <DialogContent className={Styles.modalBodyWrapper}>
        <Typography component="p" className={Styles.description}>
          {message}
        </Typography>
        <Typography component="div" className={Styles.actionWrapper}>
          <Button
            type="button"
            className={
              isSuccess ? Styles.actionButtonSuccess : Styles.actionButtonFailed
            }
            onClick={closeModal}
          >
            OK
          </Button>
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
