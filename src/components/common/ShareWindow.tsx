import { Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";
import React from "react";

import Classes from "style/Common/ShareWindow.module.scss";
import CloseIcon from "@mui/icons-material/Close";
import {
  FacebookIcon,
  FacebookShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";

interface ShareWindowType {
  url: string;
  title?: string | undefined;
  quote?: string | undefined;
  hashtag?: string | undefined;
  openShareModel: boolean;
  closeShareModel: any;
}

const ShareWindow = (props: ShareWindowType) => {
  return (
    <Dialog
      open={props.openShareModel}
      onClose={props.closeShareModel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
      className={Classes.dialogWrapper}
      maxWidth="sm"
    >
      <DialogTitle sx={{ padding: "25px" }} className={Classes.modalHeader}>
        <Typography>
          <Typography className={Classes.modalTitle} component="h4">
             Share on
          </Typography>
          <CloseIcon
            onClick={props?.closeShareModel}
            className={Classes.closeIcon}
          />
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ padding: "30px" }}>
        <Typography component="div" className={Classes.dialogeContent}>
          <FacebookShareButton
            url={props?.url}
            quote={props?.quote}
            hashtag={props?.hashtag}
          >
            <FacebookIcon round size={32} />
          </FacebookShareButton>
          <WhatsappShareButton url={props?.url}>
            <WhatsappIcon round size={32} />
          </WhatsappShareButton>

          <TwitterShareButton url={props?.url}>
            <TwitterIcon round size={32} />
          </TwitterShareButton>
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default ShareWindow;
