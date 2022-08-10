import React, { useEffect, useState } from "react";
// Material Ui Components
import { Box, Container, Grid } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import Classes from "style/Explore/ExploreDetails.module.scss";
import ExploreDetailCard from "components/ExploreDetails/ExploreDetailCard";
import MetaInfo from "components/ExploreDetails/MetaInfo";
import Description from "components/ExploreDetails/Description";
import TabsWrapper from "components/ExploreDetails/TabsWrapper";
import Offers from "components/ExploreDetails/Offers";
import CarouselCards from "components/ExploreDetails/CarouselCards";
import OwnerNft from "components/ExploreDetails/OwnerNft";
import NftInfo from "components/common/NftInfo";
import { getNftDetails } from "store/reducers/nftReducer";
import { checkPayment } from "store/reducers/messageReducer";
import ItemActivity from "components/ExploreDetails/ItemActivity";
import { useSelector, useDispatch } from "react-redux";
import { solToUSD } from "../../utils/helpers/solToDollarsPrice";

import { getAuction, getAuctionBids } from "store/reducers/auctionReducer";
import { Connection, programs } from "@metaplex/js";
import { endpoint } from "utils/helpers/getChainNetwork";
import { PublicKey } from "@solana/web3.js";
import { sleep } from "utils/helpers/createNft";
import { useWallet } from "@solana/wallet-adapter-react";
import getTimeDuration from "utils/helpers/getTimeDuration";
import moment from "moment";
import PriceHistory from "components/ExploreDetails/PriceHistory";
import { moreNftFromCollection } from "store/reducers/collectionReducer";
import axios from "axios";
import Attributes from "components/ExploreDetails/Attributes";
import { authSelector } from "store/reducers/authReducer";
import { initContract } from "web3/contractHelpers";
import {
  MARKETPLACE_CONTRACT_ADDRESS,
  MORALIS_WSS_ENDPOINT,
} from "web3/config";
import Web3 from "web3";
import {
  setIsOpen,
  setIsSuccess,
  setMessage,
} from "store/reducers/errorSuccessMessageReducer";
import { IgnorePlugin } from "webpack";

const ExploreDetails = () => {
  const { isAuth } = useSelector(authSelector).authReducer;
  const params = useParams();
  const [nftDetails, setNftDetails] = useState<any>({});

  const [auctionEnded, setAuctionEnded] = React.useState<boolean>(false);

  const [auctionData, setAuctionData] = useState<any>();
  const [auctionState, setAuctionState] = useState<number>();

  const [auctionBids, setAuctionBids] = useState<Array<any>>([]);
  const [moreNft, setMoreNft] = useState<Array<any>>([]);

  const [auctionWinnerKey, setAuctionWinnerKey] = useState<string>();
  const [auctionOpenState, setAuctionOpenState] = useState<any>({});
  const [selectedFraction, setSelectedFraction] = useState<any>(undefined);
  const [mintedFractionDetails, setMintedFractionDetails] = useState<any>(null);

  const [isFractionSold, setIsFractionSold] = useState<boolean>(false);

  const [clearBlockSelection, setClearBlockSelection] =
    useState<boolean>(false);
  const [mintedFractions, setMintedFractions] = useState<any>(null);

  const wallet: any = useWallet();
  const connection: Connection = new Connection(endpoint.url);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [window?.history]);

  const dispatch = useDispatch();
  const nftId: string = params.id || "";
  const fetchNftDetails = async () => {
    if (nftId) {
      try {
        const data: any = await dispatch(getNftDetails(nftId));
        let auctionData: any = data?.activeAuction || undefined;
        if (history.state.usr) {
          setAuctionOpenState(history.state.usr);
          auctionData = await dispatch(getAuction(history.state.usr.auctionId));
        }
        if (history.state.usr && history.state.usr.subNftId) {
          const subNftData: any = await dispatch(
            getNftDetails(history.state.usr.subNftId)
          );
          setSelectedFraction({ index: subNftData?.fractionedIndex });
        }

        if (auctionData) {
          const perBlockUsdPrice = await solToUSD(
            auctionData?.perBlockPrice,
            auctionData?.blockchainType?.toLowerCase()
          );
          auctionData = { ...auctionData, perBlockUsdPrice };
        }

        setAuctionData(auctionData);
        setNftDetails(data);

        if (auctionData?.auction) {
          const auctionKey = new PublicKey(auctionData?.auction);
          const loadedAuction = await programs.auction.Auction.load(
            connection,
            auctionKey
          );
          setAuctionState(loadedAuction.data.state);
          if (loadedAuction.data?.bidState?.bids.length) {
            const winnerIndex =
              loadedAuction.data?.bidState?.getWinnerIndex(
                wallet?.publicKey?.toBase58()
              ) || 0;

            setAuctionWinnerKey(
              loadedAuction.data?.bidState?.getWinnerAt(winnerIndex) || ""
            );
          }
          fetchBids(auctionData);
        } else if (auctionData.blockchainType !== "solana") {
          fetchBids(auctionData);
        } else {
          setAuctionBids([]);
        }
      } catch (e) {
        console.log("got error here ====>", e);
      }
    }
  };

  const getMintedFractionDetails = async () => {
    try {
      const authToken = localStorage.getItem("authToken") || "";
      const fractionedIndex = selectedFraction?.index;
      const parentId = nftDetails._id;

      const fractionedNFTResponse = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + "nft/getMintedFractionDetails",
        headers: {
          "x-auth-token": authToken,
          "Content-Type": "application/json",
        },
        data: {
          fractionedIndex,
          parentId,
        },
      });
      if (fractionedNFTResponse.status === 200) {
        if (fractionedNFTResponse?.data?.status === null) {
          setMintedFractionDetails(null);
        } else {
          setMintedFractionDetails(fractionedNFTResponse?.data);
        }
      }
    } catch (error) {
      console.log(
        "🚀 ~ file: ExploreDetails.tsx ~ line 107 ~ getMintedFractionDetails ~ error",
        error
      );
    }
  };

  const getSoldFraction = async () => {
    try {
      const parentId = nftDetails._id;

      const fractionedNFTResponse = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + "nft/getSoldFractionCount",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          parentId,
        },
      });

      if (fractionedNFTResponse.data?.soldCount > 0) {
        setIsFractionSold(true);
      }
    } catch (error) {
      console.log(
        "🚀 ~ file: ExploreDetails.tsx ~ line 107 ~ getMintedFractionDetails ~ error",
        error
      );
    }
  };

  const getAllMintedFractions = async () => {
    if (auctionData?.auctionType === "fractional") {
      try {
        const authToken = localStorage.getItem("authToken") || "";
        const parentId = nftId;
        const fractionedNFTResponse = await axios({
          method: "post",
          url: process.env.REACT_APP_BASE_URL + "nft/getAllMintedFractions",
          headers: {
            "x-auth-token": authToken,
            "Content-Type": "application/json",
          },
          data: {
            parentId,
          },
        });

        if (fractionedNFTResponse.status === 200) {
          if (fractionedNFTResponse?.data?.status === null) {
            setMintedFractions(null);
          } else {
            setMintedFractions(fractionedNFTResponse?.data);
          }
        }
      } catch (error) {
        console.log(
          "🚀 ~ file: ExploreDetails.tsx ~ line 107 ~ getMintedFractionDetails ~ error",
          error
        );
      }
    }
  };

  const fetchBids = async (auctionD: any) => {
    let auctionBids: any = await dispatch(getAuctionBids(auctionD?._id));
    const finalData = await auctionBids.map(async (bid) => {
      const usdPrice = await solToUSD(
        bid?.price,
        auctionD?.blockchainType?.toLowerCase()
      );
      return { ...bid, usdPrice };
    });
    setAuctionBids(await Promise.all(finalData));
  };

  const fetchMoreNft = async () => {
    const nfts: any = await dispatch(
      moreNftFromCollection(nftDetails?.collectionId?._id)
    );
    const collectionNft = await nfts?.filter(
      (nft: any) => nftDetails?._id !== nft._id
    );
    if (collectionNft) {
      setMoreNft(collectionNft);
    }
  };
  const listenBidEvent = async (auctionData) => {
    const web3 = new Web3(
      MORALIS_WSS_ENDPOINT[auctionData.blockchainType]?.endpoint
    );

    const chainId = await web3.eth.getChainId();

    const contract = initContract(
      web3,
      MARKETPLACE_CONTRACT_ADDRESS[chainId]?.contractABI,
      MARKETPLACE_CONTRACT_ADDRESS[chainId]?.address
    );

    const handler = async (event) => {
      await sleep(10000);
      fetchBids(auctionData);
    };
    function errorCallback(err) {
      console.error(err);
    }
    let bidSubscription = contract.events.HighestBidIcrease();
    bidSubscription.on("data", handler).on("error", errorCallback);
  };
  useEffect(() => {
    fetchMoreNft();
    getSoldFraction();
  }, [nftDetails?._id]);

  useEffect(() => {
    fetchNftDetails();
    getAllMintedFractions();
    dispatch(checkPayment(nftId));
    window.scrollTo(0, 0);
  }, [nftId]);

  useEffect(() => {
    if (selectedFraction) {
      getMintedFractionDetails();
    }
  }, [selectedFraction]);

  useEffect(() => {
    if (auctionData?.auction && (wallet.connected || isAuth)) {
      const durations = getTimeDuration(
        moment(auctionData?.endDateTime).toDate(),
        new Date()
      );

      if (durations?.seconds <= 0 && auctionData.auctionType !== "fixedPrice") {
        setAuctionEnded(true);
        fetchNftDetails();
      }
      if (auctionData?.auction) {
        const auctionKey = new PublicKey(auctionData?.auction);
        connection.onAccountChange(auctionKey, async (data) => {
          await sleep(7000);
          fetchBids(auctionData);
        });
      }
      if (auctionData?.blockchainType !== "solana") {
        listenBidEvent(auctionData);
      }
    }
    listenBidEvent(auctionData);
    getAllMintedFractions();
  }, [auctionData?._id, wallet, isAuth]);

  return (
    <Container>
      <Box className={Classes.exploreDetailsPageWrapper}>
        <Box sx={{ display: { sx: "block", lg: "none" } }}>
          <NftInfo nftDetails={nftDetails} />
        </Box>

        <Grid container spacing={3}>
          <Grid item lg={6} style={{ width: "100%" }}>
            <ExploreDetailCard
              nftDetails={nftDetails}
              auctionData={auctionData}
              selectedFraction={selectedFraction}
              mintedFractionsIndex={mintedFractions?.mintedFractionsIndex || []}
              onFractionSelect={(item: any) => {
                setClearBlockSelection(false);
                setSelectedFraction(item);
              }}
              clearSelection={clearBlockSelection}
            />
            <Description nftDetails={nftDetails} auctionData={auctionData} />
          </Grid>
          <Grid item lg={6} style={{ width: "100%" }}>
            {nftDetails && (
              <MetaInfo
                auctionOpenState={auctionOpenState}
                setAuctionEnded={setAuctionEnded}
                auctionEnded={auctionEnded}
                auctionBids={auctionBids}
                nftDetails={nftDetails}
                auctionData={auctionData}
                auctionState={auctionState}
                auctionWinnerKey={auctionWinnerKey}
                selectedFraction={selectedFraction}
                mintedFractionDetails={mintedFractionDetails}
                onFetchDetails={() => {
                  getMintedFractionDetails();
                }}
                onBuyNowSuccess={async () => {
                  getMintedFractionDetails();
                  getAllMintedFractions();
                  setSelectedFraction(undefined);
                  setClearBlockSelection(true);
                }}
                onClearSelection={() => {
                  setSelectedFraction(undefined);
                  setClearBlockSelection(true);
                }}
                isFractionSold={isFractionSold}
              />
            )}
            {/* <Genres />  */}
            {nftDetails?.attributes?.length > 0 && (
              <Attributes attributes={nftDetails?.attributes} />
            )}

            {!mintedFractionDetails && <TabsWrapper nftDetails={nftDetails} />}
            {mintedFractionDetails && (
              <TabsWrapper nftDetails={mintedFractionDetails} />
            )}
          </Grid>
        </Grid>
        {auctionData?.auctionType === "highestBid" && auctionBids.length ? (
          <Offers auctionBids={auctionBids} auctionData={auctionData} />
        ) : (
          ""
        )}
        <PriceHistory nftDetails={nftDetails} />
        <ItemActivity itemDetails={nftDetails} />
      </Box>
      {nftDetails?.nftType && <OwnerNft nftDetails={nftDetails} />}
      {moreNft.length > 3 && <CarouselCards moreNft={moreNft} />}
    </Container>
  );
};

export default ExploreDetails;
function dispatch(arg0: any) {
  throw new Error("Function not implemented.");
}
