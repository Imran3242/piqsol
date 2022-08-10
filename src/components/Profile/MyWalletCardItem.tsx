import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { CardActionArea, Typography } from "@mui/material";
import Classes from "../../style/Profile/MywalletCardItem.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { addNft, fetchNftMetaDataFromUri } from "store/reducers/nftReducer";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey } from "@solana/web3.js";
import LoadingButton from "@mui/lab/LoadingButton";
import { makeStyles } from "@mui/styles";
import { endpoint } from "utils/helpers/getChainNetwork";

import {
  setIsOpen,
  setIsSuccess,
  setMessage,
} from "store/reducers/errorSuccessMessageReducer";
import {
  extractErrorMessage,
  getFileTypeFromUrl,
} from "components/common/helpers/helpers";

import { Connection } from "@metaplex/js";

const useStyles = makeStyles({
  root: {
    "& .MuiCardMedia-media": {
      background: "var(--bg-card)",
    },
    "& .MuiCardContent-root": {
      background: "var(--bg-card)",
    },
  },
});

export default function MyWalletCardItem({ metaData, fetchUserMints }: any) {
  const dispatch = useDispatch();
  const connection = new Connection(endpoint.url);

  const currentUser = useSelector(
    (state: any) => state.authReducer.currentUser
  );

  const [nftData, setNftData] = React.useState<any>({});

  const [buttonLoading, setButtonLoading] = React.useState<boolean>(false);

  const fetchNftMetaData = async () => {
    const nftMetaData = await dispatch(
      fetchNftMetaDataFromUri(metaData.data.uri)
    );
    setNftData(nftMetaData);
  };

  React.useEffect(() => {
    if (metaData) {
      fetchNftMetaData();
    }
  }, [metaData]);

  const addNftToPiqsol = async () => {
    try {
      setButtonLoading(true);

      if (currentUser?.chainType?.toLowerCase() !== "solana") {
        const animationUrlFileType: string = await getFileTypeFromUrl(
          nftData?.animation_url || nftData?.amimation_url
        );
        let finalFileType = "image";

        if (animationUrlFileType !== "image") {
          finalFileType = animationUrlFileType;
        }

        const importedNftData: any = await dispatch(
          addNft({
            metadataContent: {
              ...nftData,
              collectionId: nftData?.collection?.id,
              properties: nftData?.properties || { category: finalFileType },
            },
            tokenId: metaData?.data?.tokenId,
            blockchainType: currentUser?.chainType?.toLowerCase(),
            contractAddress: metaData?.data?.contractAddress,
            imported: true,
          })
        );
        if (!importedNftData) {
          setButtonLoading(false);
          dispatch(setMessage("Something went wrong while importing Eth NFT"));
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(false));

          return;
        }
        await fetchUserMints();
        dispatch(setMessage("Nft added to platform"));
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(true));

        setButtonLoading(false);
        return;
      }

      const metadataPDA = await Metadata.getPDA(new PublicKey(metaData.mint));
      const tokenMetadata = await Metadata.load(connection, metadataPDA);
      const tokenEdition = await Metadata.getEdition(
        connection,
        new PublicKey(metaData.mint)
      );
      const importedNftData: any = await dispatch(
        addNft({
          ...nftData,
          mint: metaData.mint,
          metadata: tokenMetadata.pubkey.toBase58(),
          edition: tokenEdition.pubkey.toBase58(),
          imported: true,
          blockchainType: "solana",
        })
      );
      if (!importedNftData) {
        dispatch(
          setMessage(
            "Something went wrong while sending sol amount to platform wallet"
          )
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));

        setButtonLoading(false);
      } else {
        await fetchUserMints();
        dispatch(setMessage("Nft added to platform"));
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(true));

        setButtonLoading(false);
      }
    } catch (err) {
      dispatch(
        setMessage(
          "There is something wrong please try again later " +
            extractErrorMessage(err)
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
      console.log(
        "🚀 ~ file: MyWalletCardItem.tsx ~ line 125 ~ addNftToPiqsol ~ err",
        err
      );
    }
  };

  const customStyles = useStyles();

  return (
    <>
      <Card
        sx={{ maxWidth: 273 }}
        className={`${customStyles.root} ${Classes.myWalletCardItem}`}
      >
        <CardActionArea>
          <CardMedia
            component="img"
            height="273"
            image={nftData?.image}
            alt="Wallet NfT image"
          />
          <CardContent>
            <Typography
              gutterBottom
              component="div"
              className={Classes.cardName}
            >
              {nftData?.name}
            </Typography>
            <Typography
              className="VisbyDemiBold"
              sx={{ fontSize: "12px", color: "#454545", marginBottom: "10px" }}
              component="div"
            >
              {nftData?.collection?.name}
            </Typography>
            <LoadingButton
              loading={buttonLoading}
              onClick={addNftToPiqsol}
              className={Classes.importButton}
            >
              <Typography className="VisbyBold" sx={{ fontSize: "17px" }}>
                Import to Piqsol
              </Typography>
            </LoadingButton>
            {buttonLoading && (
              <Typography
                sx={{ color: "var(--text-color)" }}
                className="warning-msg"
              >
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="color-red"
                />{" "}
                Please wait, don't close the window.
              </Typography>
            )}
          </CardContent>
        </CardActionArea>
      </Card>
    </>
  );
}
