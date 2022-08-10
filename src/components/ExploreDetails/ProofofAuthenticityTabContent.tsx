import * as React from "react";

import { Typography, Box } from "@mui/material";
import Classes from "style/Explore/ProofofAuthenticityTabContent.module.scss";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

import { ReactComponent as ArrowUpRight } from "../../assets/icons/SVG/ArrowUpRight.svg";

import SolanaLogo from "assets/images/solana-logo.png";
import { endpoint } from "utils/helpers/getChainNetwork";
import { useEffect } from "react";
import { EXPLORER_LINK } from "web3/config";
import { getWeb3 } from "web3/web3";
import { CHAIN_LOGOS, CHAIN_TITLE } from "components/common/helpers/helpers";

export default function ProofofAuthenticityTabContent({ nftDetails }: any) {
  console.log(
    "🚀 ~ file: ProofofAuthenticityTabContent.tsx ~ line 17 ~ ProofofAuthenticityTabContent ~ nftDetails",
    nftDetails
  );
  const [explorerLink, setExplorerLink] = React.useState("");

  const setExplorerLinkForDetails = async () => {
    if (nftDetails.blockchainType?.toLowerCase() !== "solana") {
      setExplorerLink(
        `${EXPLORER_LINK[nftDetails?.blockchainType?.toLowerCase()]}${
          nftDetails?.contractAddress
        }?a=${nftDetails?.tokenId}`
      );
      return;
    }

    setExplorerLink(
      `https://explorer.solana.com/address/${nftDetails?.mint}?cluster=${endpoint.url}`
    );
  };

  useEffect(() => {
    if (nftDetails?._id) {
      setExplorerLinkForDetails();
    }
  }, [nftDetails?._id]);

  return (
    <Box className={Classes.ProofofAuthenticity}>
      {nftDetails?.collectionId?.isVerified && (
        <Typography className={Classes.Item}>
          <Typography className={Classes.verifiedItem}>
            <VerifiedUserIcon fontSize="small" />{" "}
            <Typography component="span" className={`${Classes.fontSize}`}>
              {" "}
              Verified
            </Typography>
          </Typography>
          <Typography
            component="span"
            className={`${Classes.fontSize}`}
            sx={{ color: "var(--text-color)" }}
          >
            by Piqsol
          </Typography>
        </Typography>
      )}
      <Typography className={Classes.Item}>
        <Typography className={Classes.verifiedItem}>
          <img
            className={Classes.logoImg}
            src={CHAIN_LOGOS[nftDetails?.blockchainType.toLowerCase()]}
          />
        </Typography>
        <Typography
          component="span"
          className={`${Classes.fontSize}`}
          sx={{ color: "var(--text-color)" }}
        >
          View on {CHAIN_TITLE[nftDetails?.blockchainType.toLowerCase()]}{" "}
          Explorer{" "}
          <a target="_blank" href={explorerLink}>
            <ArrowUpRight className={Classes.arrowIcon} />
          </a>
        </Typography>
      </Typography>
    </Box>
  );
}
