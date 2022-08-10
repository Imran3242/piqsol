import * as React from "react";
import { Grid, Typography, Button } from "@mui/material";
import MyWalletCardItem from "./MyWalletCardItem";
import { useDispatch, useSelector } from "react-redux";
import { getUserMintsArray } from "store/reducers/userReducer";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { Connection } from "@metaplex/js";
import { useWallet } from "@solana/wallet-adapter-react";
import Classes from "../../style/Profile/MyWalletTabContent.module.scss";
import { CircularProgress } from "@material-ui/core";
import { useMoralisWeb3Api } from "react-moralis";
import { getWeb3 } from "web3/web3";
import { CHAIN_NAME_BY_CHAIN_ID } from "components/common/helpers/helpers";
import { endpoint } from "utils/helpers/getChainNetwork";

const MyWalletTabContent = () => {
  const [mintToShow, setMintToShow] = React.useState<any>([]);

  const [responseFromMoralis, setResponseFromMoralis] = React.useState<any>({});
  const [page, setPage] = React.useState<number>(0);
  const dispatch = useDispatch();
  const wallet = useWallet();
  const [showLoadingBtn, setLoadingBtn] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);
  const Web3Api = useMoralisWeb3Api();

  const currentUser = useSelector(
    (state: any) => state.authReducer.currentUser
  );

  const fetchUserEthMints = async () => {
    try {
      const web3 = await getWeb3();
      const chainId = await web3.eth.getChainId();
      const ownersAllNfts: any = await Web3Api.account.getNFTs({
        chain: CHAIN_NAME_BY_CHAIN_ID[chainId],
        address: currentUser?.walletAddress,
      });

      const userMints: any = await dispatch(getUserMintsArray());
      const mints = ownersAllNfts?.result?.filter((nft: any) => {
        const found = userMints.find(
          (userMint: any) =>
            userMint.tokenId === nft?.token_id &&
            userMint?.contractAddress?.toLowerCase() ===
              nft?.token_address?.toLowerCase()
        );
        return !found;
      });
      setMintToShow(mints);
      setResponseFromMoralis(ownersAllNfts);
      setLoading(false);
      if (!ownersAllNfts?.next) {
        setLoadingBtn(false);
      }
    } catch (err) {
      console.log(
        "🚀 ~ file: MyWalletTabContent.tsx ~ line 44 ~ fetchUserEthMints ~ err",
        err
      );
    }
  };

  const fetchUserMints = async () => {
    setLoading(true);
    setLoadingBtn(true);

    if (currentUser?.chainType?.toLowerCase() !== "solana") {
      await fetchUserEthMints();
      return;
    }

    const connection = new Connection(endpoint.url);
    const ownerPublickey: any = wallet.publicKey;
    const nftsmetadata: any = await Metadata.findDataByOwner(
      connection,
      ownerPublickey
    );
    const userMints: any = await dispatch(getUserMintsArray());

    const mints = nftsmetadata.filter((nft: any) => {
      const found = userMints.find(
        (userMint: any) =>
          userMint.mint?.toLowerCase() === nft.mint?.toLowerCase()
      );
      return !found;
    });

    setMintToShow(mints);
    setLoading(false);
    setLoadingBtn(false);
  };

  React.useEffect(() => {
    fetchUserMints();
  }, []);

  React.useEffect(() => {
    if (wallet?.connected) fetchUserMints();
  }, [wallet?.connected]);

  const handlePagination = async () => {
    setLoading(true);
    if (responseFromMoralis?.next) {
      const resopnse: any = await responseFromMoralis?.next();
      const userMints: any = await dispatch(getUserMintsArray());
      const mints = resopnse?.result?.filter((nft: any) => {
        const found = userMints.find(
          (userMint: any) => userMint.tokenId === nft.token_id
        );
        return !found;
      });
      setMintToShow([...mintToShow, ...mints]);
      setResponseFromMoralis(resopnse);
      setLoading(false);
      if (!resopnse?.next) {
        setLoadingBtn(false);
      }
    }
  };

  React.useEffect(() => {
    handlePagination();
  }, [page]);

  return (
    <Grid container sx={{ marginTop: "20px" }} spacing={3}>
      {mintToShow?.map((nft: any) => (
        <Grid item xs={6} lg={3}>
          <MyWalletCardItem
            fetchUserMints={fetchUserMints}
            metaData={
              currentUser?.chainType?.toLowerCase() !== "solana"
                ? {
                    data: {
                      uri: nft?.token_uri,
                      tokenId: nft?.token_id?.toString(),
                      contractAddress: nft?.token_address,
                    },
                  }
                : nft
            }
            video={true}
          />
        </Grid>
      ))}

      {showLoadingBtn && (
        <Typography component="div" className={Classes.loadMoreWrapper}>
          <Button
            className={Classes.loadMoreButton}
            onClick={() => setPage(page + 1)}
          >
            Load More
            {isLoading && (
              <CircularProgress
                style={{ marginLeft: 10 }}
                size={30}
                color="inherit"
              />
            )}
          </Button>
        </Typography>
      )}
    </Grid>
  );
};

export default MyWalletTabContent;
