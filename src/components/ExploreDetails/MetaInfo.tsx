import * as React from "react";
// Material Ui Components
import { Typography, Box, Button, Grid, CircularProgress } from "@mui/material";
import NftBlockSelection from "./NftBlockSelection";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import VideoMetaInfo from "./VideoMetaInfo";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import CardBox from "./CardBox";
import Classes from "style/Explore/MetaInfo.module.scss";
import WalletIcon from "../../assets/icons/wallet.png";
import BuyNowModal from "./BuyNowModal";
import { userPaymentAction } from "store/reducers/messageReducer";
import MakeOfferModal from "./MakeOfferModal";
import { Link, useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { useDispatch, useSelector } from "react-redux";
import { Creator } from "../../utils/helpers/createNft";
import { addNft } from "store/reducers/nftReducer";
import { mintFraction } from "utils/helpers/uploadFileToIpfs";
import axios from "axios";
import { actions, Connection, programs } from "@metaplex/js";
import {
  CHAIN_TITLE,
  extractErrorMessage,
  getConvertedDecimalPrice,
  setPriceUptoThreeDecimal,
} from "../common/helpers/helpers";
import { WalletModal } from "../walletAdapter";
import NftInfo from "components/common/NftInfo";

import { endpoint } from "../../utils/helpers/getChainNetwork";
import {
  PublicKey,
  LAMPORTS_PER_SOL,
  TransactionSignature,
} from "@solana/web3.js";
import BN from "bn.js";
import {
  checkForAuctionAlreadyProcessedOrNot,
  getAuctionBids,
  getBid,
  placeBid,
  updateAuction,
  updateAuctionProcessingOnError,
  updateBid,
  updateNft,
  updateNftOwner,
} from "store/reducers/auctionReducer";

import {
  cancelBidInstraction,
  claimBidInstruction,
  placeBidInstruction,
  redeemNFTInstruction,
  closeAssociatedAccountInstruction,
  payFractionalMintPrice,
  reclaimNFTInstruction,
  getEndAuctionInstructions,
} from "utils/helpers/auctionWithInstructionUtils";
import {
  sendTransactions,
  sendTransactionsSmart,
} from "utils/helpers/auctionTransactionHelper";
import { emptyPaymentAccountFunc } from "utils/helpers/emptyPaymentAccountTransaction";
import { updateNotification } from "store/reducers/notificatonReducer";
import { getTaxationAmount } from "utils/helpers/customTokenAuctionUtils";
import { getUserBalance } from "utils/helpers/getUserBalance";
import {
  getCurrentPrice,
  getCurrentPriceInUSD,
} from "utils/helpers/getCurrentPrice";
import { CHAIN_LOGOS } from "components/common/helpers/helpers";
import { checkForMetamaskNetwork } from "../../web3/web3";
import { getWeb3 } from "../../web3/web3";
import {
  buyNowFixedPriceNft,
  cancelListingFnFT,
  cancelListingsOfFixedPrice,
  endAuction,
  initContract,
  mintFNFT,
  placeNftBid,
} from "../../web3/contractHelpers";
import { MARKETPLACE_CONTRACT_ADDRESS } from "../../web3/config";

import {
  setIsOpen,
  setIsSuccess,
  setMessage,
} from "store/reducers/errorSuccessMessageReducer";

import CountDown from "components/common/CountDown";
import moment from "moment";
const MAX_RETRIES = 24;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function metaplexConfirm(tx: any) {
  let confirmedTx = null;
  for (let tries = 0; tries < MAX_RETRIES; tries++) {
    confirmedTx = await new Connection(
      endpoint.url,
      "finalized"
    ).getTransaction(tx);
    if (confirmedTx) break;
    await sleep(3000);
  }
  if (!confirmedTx) throw new Error("Could not find requested transaction");
}

export interface InstantSaleResponse {
  txIds: TransactionSignature[];
}

const cancelBid = async function ({
  connection,
  auction,
  bidderPotToken,
  wallet,
}: any) {
  const bid = await actions.cancelBid({
    connection,
    wallet,
    auction: auction,
    bidderPotToken: bidderPotToken,
  });
  await metaplexConfirm(bid.txId);
  return { ...bid };
};

export const claimNFT = async ({
  connection,
  wallet,
  auction,
  store,
  bidderPotToken,
}: any) => {
  const claimNftBidInstructions = await placeBidInstruction({
    connection,
    bidderWallet: wallet,
    amount: new BN(0),
    auction: new PublicKey(auction),
    taxFee: new BN(0),
  });

  if (claimNftBidInstructions === -1) {
    return -1;
  }

  const {
    instructions: bidInstructions,
    signers: bidSigners,
    taxInstructions: taxInstructions2,
    taxSigners: taxSigners2,
    bidderMeta,
    bidderPotToken: bidPotTokenZero,
  }: any = claimNftBidInstructions;

  const {
    instructions: redeemInstructions,
    signers: redeemSigners,
    tokenAccount,
  } = await redeemNFTInstruction({
    connection,
    bidderWallet: wallet,
    auction: new PublicKey(auction),
    store: new PublicKey(store),
  });

  let { instructions: claimBidInstructions, signers: claimBidSigners } =
    await claimBidInstruction({
      connection,
      wallet: wallet,
      store,
      auction,
      bidderPotToken,
    });

  const lookup = {
    payTax: {
      instructions: taxInstructions2,
      signers: taxSigners2,
    },
    zeroBidPlaced: {
      instructions: bidInstructions,
      signers: bidSigners,
    },
    redeemNft: {
      instructions: redeemInstructions,
      signers: redeemSigners,
    },
    claimBid: {
      instructions: claimBidInstructions,
      signers: claimBidSigners,
    },
  };

  let signers = [
    lookup.payTax.signers,
    lookup.zeroBidPlaced.signers,
    lookup.redeemNft.signers,
    lookup.claimBid.signers,
  ];
  let toRemoveSigners: any = [];
  let instructions = [
    lookup.payTax.instructions,
    lookup.zeroBidPlaced.instructions,
    lookup.redeemNft.instructions,
    lookup.claimBid.instructions,
  ].filter((instr, i) => {
    if (instr.length > 0) {
      return true;
    } else {
      toRemoveSigners[i] = true;
      return false;
    }
  });

  let filteredSigners = signers.filter((_, i) => !toRemoveSigners[i]);
  await sendTransactions(
    connection,
    wallet,
    instructions,
    filteredSigners,
    "single"
  );
};

export const instantSale = async ({
  connection,
  wallet,
  store,
  auction,
  buyNowPiqsolFee,
  currentUser,
}: any) => {
  const txIds: Array<any> = [];
  const auctionManagerPDA = await programs.metaplex.AuctionManager.getPDA(
    auction
  );
  const manager = await programs.metaplex.AuctionManager.load(
    connection,
    auctionManagerPDA
  );

  const vault = await programs.vault.Vault.load(connection, manager.data.vault);
  const auctionExtendedPDA = await programs.auction.AuctionExtended.getPDA(
    vault.pubkey
  );
  const {
    data: { instantSalePrice },
  } = await programs.auction.AuctionExtended.load(
    connection,
    auctionExtendedPDA
  );

  const [safetyDepositBox] = await vault.getSafetyDepositBoxes(connection);
  const safetyDepositConfigPDA =
    await programs.metaplex.SafetyDepositConfig.getPDA(
      auctionManagerPDA,
      safetyDepositBox.pubkey
    );
  const {
    data: { winningConfigType, participationConfig },
  } = await programs.metaplex.SafetyDepositConfig.load(
    connection,
    safetyDepositConfigPDA
  );
  const instantSaleInstructions = await placeBidInstruction({
    connection,
    bidderWallet: wallet,
    amount: instantSalePrice,
    auction: new PublicKey(auction),
    taxFee: new BN(Number(buyNowPiqsolFee)),
    currentUser,
  });

  if (instantSaleInstructions === -1) {
    return -1;
  }

  const {
    taxInstructions: taxInstructions2,
    taxSigners: taxSigners2,
    instructions: bidInstructions,
    signers: bidSigners,
    bidderMeta,
    bidderPotToken,
  }: any = instantSaleInstructions;

  const {
    data: { bidState },
  } = await programs.auction.Auction.load(connection, auction);
  const winIndex = bidState.getWinnerIndex(wallet.publicKey.toBase58());
  const hasWinner = winIndex !== null;

  const {
    instructions: redeemInstructions,
    signers: redeemSigners,
    tokenAccount,
  } = await redeemNFTInstruction({
    connection,
    bidderWallet: wallet,
    auction: new PublicKey(auction),
    store: new PublicKey(store),
  });

  let { instructions: claimBidInstructions, signers: claimBidSigners } =
    await claimBidInstruction({
      connection,
      wallet: wallet,
      store,
      auction,
      bidderPotToken,
    });

  const lookup = {
    payTax: {
      instructions: taxInstructions2,
      signers: taxSigners2,
    },
    placeBid: {
      instructions: bidInstructions,
      signers: bidSigners,
    },
    redeemNft: {
      instructions: redeemInstructions,
      signers: redeemSigners,
    },
    claimBid: {
      instructions: claimBidInstructions,
      signers: claimBidSigners,
    },
  };

  let signers = [
    lookup.payTax.signers,
    lookup.placeBid.signers,
    lookup.redeemNft.signers,
    lookup.claimBid.signers,
  ];
  let toRemoveSigners: any = [];
  let instructions = [
    lookup.payTax.instructions,
    lookup.placeBid.instructions,
    lookup.redeemNft.instructions,
    lookup.claimBid.instructions,
  ].filter((instr, i) => {
    if (instr.length > 0) {
      return true;
    } else {
      toRemoveSigners[i] = true;
      return false;
    }
  });

  let filteredSigners = signers.filter((_, i) => !toRemoveSigners[i]);
  const { isAllSuccess, txList }: any = await sendTransactionsSmart(
    connection,
    wallet,
    instructions,
    filteredSigners,
    "single"
  );
  if (!isAllSuccess) {
    return false;
  }
  return txList[0];
};

const MetaInfo = ({
  nftDetails,
  auctionData,
  auctionBids,
  auctionEnded,
  setAuctionEnded,
  auctionState,
  auctionWinnerKey,
  auctionOpenState,
  selectedFraction,
  mintedFractionDetails,
  onBuyNowSuccess,
  onClearSelection,
  onFetchDetails,
  isFractionSold,
}: {
  nftDetails: any;
  auctionData: any;
  auctionBids: any;
  auctionEnded: boolean;
  auctionOpenState: any;
  auctionState: number | undefined;
  auctionWinnerKey: string | undefined;
  setAuctionEnded: (value: boolean) => void;
  selectedFraction: any;
  mintedFractionDetails: any;
  onBuyNowSuccess: any;
  onClearSelection: any;
  onFetchDetails: any;
  isFractionSold: any;
}) => {
  const wallet: any = useWallet();
  const connection: Connection = new Connection(endpoint.url);
  const systemSetting = useSelector(
    (state: any) => state?.systemSettingReducer?.systemSettings
  );

  const [open, setOpen] = React.useState(false);
  const [removeNftLoading, setRemoveNftLoading] = React.useState(false);

  const navigate = useNavigate();
  const [buyNftLoader, setBuyNftLoader] = React.useState<boolean>(false);
  const dispatch = useDispatch();
  const [bidAmount, setBidAmount] = React.useState<Number>(0.2);
  const [currentPriceInSol, setCurrentPriceInSol] = React.useState<number>(0);
  const [currentPriceInUSD, setCurrentPriceInUSD] = React.useState<number>(0);

  const [refundBid, setRefundBid] = React.useState<any>({});
  const [openMakeOfferModal, setOpenMakeOfferModal] = React.useState(false);
  const [userPQLbalance, setUserPQLBalance] = React.useState(0);

  const [isVisible, setIsVisible] = React.useState<boolean>(false);

  const currentUser = useSelector(
    (state: any) => state.authReducer.currentUser
  );
  const storeKey = new PublicKey(process.env.REACT_APP_METAPLEX_STORE_ID || "");

  const openBuyNowModal = () => {
    if (!currentUser) setIsVisible(true);
    if (currentUser) setOpen(true);
  };
  const closeBuyNowModal = () => {
    setOpen(false);
  };
  const showMakeOfferModal = () => {
    if (!currentUser) setIsVisible(true);
    if (currentUser) setOpenMakeOfferModal(true);
  };
  const closeMakeOfferModal = () => {
    setOpenMakeOfferModal(false);
  };

  const mintFractionalNft = async (signature) => {
    try {
      setBuyNftLoader(true);
      const nftId = nftDetails?._id;
      const auctionId = auctionData?._id;
      const creators = [
        new Creator({
          address: wallet?.publicKey?.toBase58(),
          verified: true,
          share: 100,
        }),
      ];
      const authToken = localStorage.getItem("authToken") || "";

      const uploadFractionData = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + "nft/uploadFractionsToIpfs",
        headers: {
          "x-auth-token": authToken,
        },
        data: {
          fraction: selectedFraction,
          creators,
          auctionId: auctionId,
          nftId: nftId,
        },
      });
      const res = uploadFractionData.data;
      if (uploadFractionData.status === 200) {
        const fractionMetadataUri = res.metadataIpfsUrl;
        const mintResponse: any = await mintFraction(
          fractionMetadataUri,
          0,
          wallet
        );
        await metaplexConfirm(mintResponse.txId);
        if (mintResponse?.txId) {
          const price =
            auctionData?.perBlockPrice +
            getTaxationAmount({
              transactionAmount: auctionData?.perBlockPrice,
            });
          const nftData: any = await dispatch(
            addNft({
              mint: mintResponse.mint.toBase58(),
              metadata: mintResponse.metadata.toBase58(),
              edition: mintResponse.edition.toBase58(),
              nftType: "Fraction",
              parentId: nftDetails?._id,
              collectionId: nftDetails?.collectionId?._id,
              parentMintId: nftDetails?.mint,
              fractionedIndex: selectedFraction?.index,
              price: price,
              blockchainType: "solana",
            })
          );
          setBuyNftLoader(false);
          if (nftData.status === 200) {
            onBuyNowSuccess();
            await dispatch(
              userPaymentAction(
                nftDetails._id,
                null,
                currentUser.id,
                systemSetting?.buyNowPiqsolFee,
                signature,
                "buy"
              )
            );

            dispatch(setMessage("Fraction Block Purchased Successfully"));
            dispatch(setIsOpen(true));
            dispatch(setIsSuccess(true));

            closeBuyNowModal();
          }
        }
      }
    } catch (e: any) {
      setBuyNftLoader(false);
      dispatch(
        setMessage("Error while Buying Fraction " + extractErrorMessage(e))
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));

      closeBuyNowModal();
    }
  };

  const buyNowNftForEthChain = async () => {
    try {
      setBuyNftLoader(true);
      if (auctionData?.auctionType !== "fractional") {
        const web3 = await getWeb3();

        const chainId = await web3.eth.getChainId();
        const contractDetails = MARKETPLACE_CONTRACT_ADDRESS[chainId];
        const contract = new web3.eth.Contract(
          contractDetails.contractABI,
          contractDetails.address
        );
        const buyFixedPriceNftResponse = await buyNowFixedPriceNft(
          web3,
          contract,
          auctionData?.marketplaceItemId,
          auctionData?.auctionPrice,
          systemSetting?.buyNowPiqsolFee
        );

        if (buyFixedPriceNftResponse === -2) {
          setBuyNftLoader(false);
          await dispatch(
            updateAuctionProcessingOnError(auctionData?._id, selectedFraction)
          );

          dispatch(
            setMessage(
              "You don't have PQL tokens or there is something went wrong while fetching your balance"
            )
          );
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(false));

          return;
        }

        if (buyFixedPriceNftResponse === false) {
          setBuyNftLoader(false);
          await dispatch(
            updateAuctionProcessingOnError(auctionData?._id, selectedFraction)
          );

          dispatch(setMessage("Approval for tax paying is required"));
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(false));

          return;
        }

        if (
          buyFixedPriceNftResponse?.status &&
          buyFixedPriceNftResponse?.transactionHash
        ) {
          dispatch(setMessage("NFT purchased and Trasnfered to your wallet"));
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(true));

          await dispatch(
            updateAuction(auctionData._id, {
              status: "end",
              nftId: nftDetails._id,
              userId: currentUser.id,
              price: auctionData.auctionPrice,
              txnHash: buyFixedPriceNftResponse?.transactionHash,
            })
          );
          navigate(`/${currentUser?.id}/myCollected`);
          setBuyNftLoader(false);
        }
        await dispatch(
          updateAuctionProcessingOnError(auctionData?._id, selectedFraction)
        );

        dispatch(setMessage("Something went wrong whilte purchasing NFT"));
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));

        return;
      } else {
        try {
          const nftId = nftDetails?._id;
          const auctionId = auctionData?._id;
          const creators = [
            new Creator({
              address: wallet?.publicKey?.toBase58(),
              verified: true,
              share: 100,
            }),
          ];
          const authToken = localStorage.getItem("authToken") || "";

          const uploadFractionData = await axios({
            method: "post",
            url: process.env.REACT_APP_BASE_URL + "nft/uploadFractionsToIpfs",
            headers: {
              "x-auth-token": authToken,
            },
            data: { fraction: selectedFraction, creators, nftId, auctionId },
          });
          const res = uploadFractionData.data;

          const newlyMintNftResponse: any = await mintFNFT(
            currentUser,
            res?.metadataIpfsUrl,
            nftDetails?.userId.walletAddress,
            auctionData?.perBlockPrice,
            systemSetting?.mintPiqsolFee || 0,
            parseInt(nftDetails?.tokenId),
            nftDetails?.contractAddress
          );

          if (newlyMintNftResponse === -2) {
            setBuyNftLoader(false);
            await dispatch(
              updateAuctionProcessingOnError(auctionData?._id, selectedFraction)
            );
            dispatch(
              setMessage(
                "You don't have PQL tokens or there is something went wrong while fetching your balance"
              )
            );
            dispatch(setIsOpen(true));
            dispatch(setIsSuccess(false));
            return;
          }

          if (newlyMintNftResponse === false) {
            setBuyNftLoader(false);
            await dispatch(
              updateAuctionProcessingOnError(auctionData?._id, selectedFraction)
            );

            dispatch(setMessage("Approval for tax paying is required"));
            dispatch(setIsOpen(true));
            dispatch(setIsSuccess(false));

            return;
          }

          if (newlyMintNftResponse?.mintNftResults?.status) {
            const price =
              auctionData?.perBlockPrice +
              getTaxationAmount({
                transactionAmount: auctionData?.perBlockPrice,
              });
            const nftData: any = await dispatch(
              addNft({
                metadataContent: res.nftMetaData,
                txnHash: newlyMintNftResponse?.mintNftResults?.transactionHash,
                tokenId:
                  newlyMintNftResponse?.mintNftResults?.events?.Transfer?.returnValues?.tokenId.toString(),
                blockchainType: currentUser?.chainType?.toLowerCase(),
                nftType: "Fraction",
                parentId: nftDetails?._id,
                collectionId: nftDetails?.collectionId?._id,
                parentMintId: nftDetails?.mint,
                fractionedIndex: selectedFraction?.index,
                price: price,
                contractAddress: newlyMintNftResponse?.contractAddress,
              })
            );

            dispatch(setMessage("NFT purchased and Transfered to your wallet"));
            dispatch(setIsOpen(true));
            dispatch(setIsSuccess(true));

            navigate(`/explore/explore-details/${nftData?.data?._id}`);
            setOpen(false);
            return;
          }
        } catch (err) {
          await dispatch(
            updateAuctionProcessingOnError(auctionData?._id, selectedFraction)
          );
          dispatch(
            setMessage(
              "Something went wrong while purchasing NFT " +
                extractErrorMessage(err)
            )
          );
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(false));

          console.log(
            "🚀 ~ file: MetaInfo.tsx ~ line 704 ~ buyNowNftForEthChain ~ err",
            err
          );
          return;
        }
      }
    } catch (err) {
      dispatch(
        setMessage(
          "Something went wrong while purchasing NFT " +
            extractErrorMessage(err)
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
      console.log(
        "🚀 ~ file: MetaInfo.tsx ~ line 525 ~ buyNftHandler ~ err",
        err
      );
    } finally {
      setBuyNftLoader(false);
      return;
    }
  };

  const buyNftHandler = async () => {
    setBuyNftLoader(true);

    if (
      auctionData?.blockchainType?.toLowerCase() !==
      currentUser?.chainType?.toLowerCase()
    ) {
      setBuyNftLoader(false);
      dispatch(
        setMessage(
          `You're on wrong chain please switch your chain to ${
            CHAIN_TITLE[auctionData?.blockchainType?.toLowerCase()]
          }`
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
      return;
    }
    const res: any = await dispatch(
      checkForAuctionAlreadyProcessedOrNot(auctionData?._id, selectedFraction)
    );

    if (res?.processing) {
      setBuyNftLoader(false);

      dispatch(setMessage(extractErrorMessage(res?.message)));
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(true));
      return;
    }

    if (auctionData?.blockchainType?.toLowerCase() !== "solana") {
      await buyNowNftForEthChain();
      return;
    }
    const userBalanceAva = await checkUserBalance(
      bidAmount,
      systemSetting.buyNowPiqsolFee
    );

    if (!userBalanceAva) {
      await dispatch(
        updateAuctionProcessingOnError(auctionData?._id, selectedFraction)
      );
      return false;
    }

    if (auctionData.auctionType === "fractional") {
      try {
        setBuyNftLoader(true);

        const nft_owner = new PublicKey(nftDetails.userId.walletAddress);
        const payFractionalMintPriceParams = {
          connection,
          wallet,
          price: auctionData?.perBlockPrice,
          nft_owner,
          taxFee: systemSetting?.buyNowPiqsolFee,
        };

        const isTaxPaid = await payFractionalMintPrice(
          payFractionalMintPriceParams
        );

        if (isTaxPaid === -1) {
          await dispatch(
            updateAuctionProcessingOnError(auctionData?._id, selectedFraction)
          );

          dispatch(
            setMessage(
              "You must have sol and piqsol token in your wallet for this action"
            )
          );
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(false));

          return;
        }

        if (isTaxPaid === false) {
          await dispatch(
            updateAuctionProcessingOnError(auctionData?._id, selectedFraction)
          );

          dispatch(setMessage("Something went wrong while paying tax"));
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(false));
          return;
        }

        await mintFractionalNft(isTaxPaid[0]);

        return true;
      } catch (err) {
        dispatch(
          setMessage("Something went wrong " + extractErrorMessage(err))
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        await dispatch(
          updateAuctionProcessingOnError(auctionData?._id, selectedFraction)
        );
        console.log("error while purchasing fractional part:", err);
      } finally {
        setBuyNftLoader(false);
      }
    } else {
      try {
        setBuyNftLoader(true);
        const txHas = await instantSale({
          connection,
          wallet,
          store: storeKey,
          auction: new PublicKey(auctionData.auction),
          buyNowPiqsolFee: systemSetting?.buyNowPiqsolFee,
          currentUser,
        });

        if (txHas === -1) {
          setBuyNftLoader(false);
          await dispatch(
            updateAuctionProcessingOnError(auctionData?._id, selectedFraction)
          );
          dispatch(
            setMessage(
              "You must have sol and piqsol token in your wallet for this action"
            )
          );
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(false));
          return;
        }

        if (!txHas) {
          await dispatch(
            updateAuctionProcessingOnError(auctionData?._id, selectedFraction)
          );
          dispatch(setMessage("Something went wrong while paying tax"));
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(false));

          return;
        }

        dispatch(setMessage("NFT sent to your wallet"));
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(true));

        await dispatch(
          updateAuction(auctionData._id, {
            status: "claimPrice",
            nftId: nftDetails._id,
            userId: currentUser.id,
            price: auctionData.auctionPrice,
          })
        );

        await dispatch(
          userPaymentAction(
            nftDetails._id,
            null,
            currentUser.id,
            systemSetting?.buyNowPiqsolFee,
            txHas[0],
            "buy"
          )
        );

        navigate(`/${currentUser?.id}/myCollected`);
        setBuyNftLoader(false);
      } catch (error) {
        await dispatch(
          updateAuctionProcessingOnError(auctionData?._id, selectedFraction)
        );
        console.log("buyNftHandler error", error);
        dispatch(
          setMessage(
            "There is something wrong please try again later" +
              extractErrorMessage(error)
          )
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));

        setBuyNftLoader(false);
      }
    }
  };

  const reNavigate = async () => {
    navigate(`/explore`);
  };

  const claimNftHandler = async () => {
    if (buyNftLoader) return true;
    try {
      setBuyNftLoader(true);
      const bidderPotToken = auctionBids[0].bidderPotToken;
      const response = await claimNFT({
        connection,
        wallet,
        auction: new PublicKey(auctionData.auction),
        store: storeKey,
        bidderPotToken: new PublicKey(bidderPotToken),
      });

      if (response === -1) {
        setBuyNftLoader(false);

        dispatch(
          setMessage(
            "You must have sol and piqsol token in your wallet for this action"
          )
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        return;
      }

      await dispatch(
        updateAuction(auctionData._id, {
          status: "claimPrice",
          nftId: nftDetails._id,
          userId: currentUser.id,
          price: auctionBids[0].price,
        })
      );

      dispatch(setMessage("NFT sent to your wallet"));
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(true));
      setBuyNftLoader(false);
      reNavigate();
    } catch (error) {
      console.log("claim nft error", error);
      dispatch(
        setMessage(
          "There is something wrong please try again later" +
            extractErrorMessage(error)
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));

      setBuyNftLoader(false);
    }
  };
  const endYourAuction = async () => {
    try {
      setBuyNftLoader(true);

      const web3 = await getWeb3();

      const chainId = await web3.eth.getChainId();

      const contract = initContract(
        web3,
        MARKETPLACE_CONTRACT_ADDRESS[chainId]?.contractABI,
        MARKETPLACE_CONTRACT_ADDRESS[chainId]?.address
      );
      const auctionEnd = await endAuction(
        web3,
        contract,
        auctionData?.marketplaceItemId
      );
      if (auctionEnd?.transactionHash) {
        const auctionBids: any = await dispatch(
          getAuctionBids(auctionData._id)
        );
        var currentPrice = auctionBids[0]?.price || auctionData?.auctionPrice;
        const auctionResult = await dispatch(
          updateAuction(auctionData._id, {
            nftId: nftDetails._id,
            userId: currentUser.id,
            price: currentPrice,
            status: "end",
          })
        );
        if (auctionBids.length > 0) {
          await dispatch(
            updateBid(auctionBids[0]?._id, {
              status: "winner",
            })
          );
          await dispatch(
            updateNftOwner(nftDetails?._id, { userId: auctionBids[0]?.userId })
          );
        }

        dispatch(setMessage("Your auction ended successfully."));
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(true));

        setBuyNftLoader(false);
        setAuctionEnded(false);
        navigate("/explore");
        return;
      }
    } catch (err) {
      dispatch(
        setMessage(
          "Something went wrong while ending auction." +
            extractErrorMessage(err)
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
      setBuyNftLoader(false);
      return;
    }
  };
  const makeAnOfferHandler = async () => {
    if (
      auctionData?.blockchainType?.toLowerCase() !==
      currentUser?.chainType?.toLowerCase()
    ) {
      setBuyNftLoader(false);
      dispatch(
        setMessage(
          `You're on wrong chain please switch your chain to ${
            CHAIN_TITLE[auctionData?.blockchainType?.toLowerCase()]
          }`
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
      return;
    }

    if (buyNftLoader) return false;
    try {
      setBuyNftLoader(true);
      if (Number(auctionData.auctionPrice) >= bidAmount) {
        dispatch(setMessage("Bid is to low"));
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));

        return setBuyNftLoader(false);
      }
      if (currentUser?.chainType?.toLowerCase() !== "solana") {
        await checkForMetamaskNetwork(currentUser?.chainType);

        const web3 = await getWeb3();

        const chainId = await web3.eth.getChainId();

        const contract = initContract(
          web3,
          MARKETPLACE_CONTRACT_ADDRESS[chainId]?.contractABI,
          MARKETPLACE_CONTRACT_ADDRESS[chainId]?.address
        );

        const placeAuctionBid = await placeNftBid(
          web3,
          contract,
          auctionData?.marketplaceItemId,
          bidAmount,
          systemSetting?.placeOfferFeePercentage || 0
        );

        if (placeAuctionBid === -2) {
          setBuyNftLoader(false);

          dispatch(
            setMessage(
              "You don't have PQL tokens or there is something went wrong while fetching your balance"
            )
          );
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(false));

          return;
        }

        if (placeAuctionBid === false) {
          setBuyNftLoader(false);
          await dispatch(
            updateAuctionProcessingOnError(auctionData?._id, selectedFraction)
          );

          dispatch(setMessage("Approval for tax paying is required"));
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(false));

          return;
        }

        if (placeAuctionBid?.transactionHash && placeAuctionBid?.status) {
          const auctionBids: any = await dispatch(
            getAuctionBids(auctionData._id)
          );
          if (auctionBids.length > 0) {
            await dispatch(
              updateBid(auctionBids[0]?._id, {
                status: "expired",
              })
            );
          }
          await dispatch(
            placeBid({
              auctionId: auctionData._id,
              auction: auctionData.auction,
              store: auctionData.storeId,
              price: bidAmount,
              txId: placeAuctionBid?.transactionHash,
              tokenId: nftDetails?.tokenId,
            })
          );

          dispatch(setMessage("Your bid has been placed successfully."));
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(true));

          setBuyNftLoader(false);
          closeMakeOfferModal();
          return;
        }

        dispatch(setMessage("Something went wrong while bidding"));
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));

        setBuyNftLoader(false);
        return;
      }
      const userBalanceAva = await checkUserBalance(
        bidAmount,
        systemSetting.makeAnOfferPiqsolFee
      );

      if (!userBalanceAva) {
        return false;
      }

      const biderExitData = auctionBids.find(
        (bid: any) =>
          bid.userId._id === currentUser.id && bid.status === "pending"
      );

      if (auctionBids.length && Number(auctionBids[0]?.price) >= bidAmount) {
        dispatch(setMessage("Bid already exist"));
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));

        return setBuyNftLoader(false);
      }
      if (biderExitData) {
        const { instructions: bidCancelInstruction, signers: bidCancelSinger } =
          await cancelBidInstraction({
            connection,
            wallet,
            auction: new PublicKey(auctionData.auction),
            bidderPotToken: new PublicKey(biderExitData.bidderPotToken),
          });

        const lookup = {
          cancelBid: {
            instructions: bidCancelInstruction,
            signers: bidCancelSinger,
          },
        };

        let signers = [lookup.cancelBid.signers];
        let toRemoveSigners: any = [];
        let instructions = [lookup.cancelBid.instructions].filter(
          (instr, i) => {
            if (instr.length > 0) {
              return true;
            } else {
              toRemoveSigners[i] = true;
              return false;
            }
          }
        );

        let filteredSigners = signers.filter((_, i) => !toRemoveSigners[i]);
        const txs = await sendTransactions(
          connection,
          wallet,
          instructions,
          filteredSigners,
          "single"
        );
        await dispatch(
          updateBid(biderExitData?._id, {
            status: "expired",
          })
        );
      }
      const makeOfferInstructions = await placeBidInstruction({
        connection,
        bidderWallet: wallet,
        amount: new BN(Number(bidAmount) * LAMPORTS_PER_SOL),
        auction: new PublicKey(auctionData.auction),
        taxFee: new BN(Number(systemSetting?.makeAnOfferPiqsolFee)),
        currentUser,
      });

      if (makeOfferInstructions === -1) {
        dispatch(
          setMessage(
            "You don't have enough PiqSol Tokens or SOL, please recharge"
          )
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        return;
      }

      const {
        instructions: bidInstructions,
        signers: bidSigners,
        taxInstructions: taxInstructions2,
        taxSigners: taxSigners2,
        bidderMeta,
        bidderPotToken,
      }: any = makeOfferInstructions;
      const lookup = {
        payTax: {
          instructions: taxInstructions2,
          signers: taxSigners2,
        },
        placeBid: {
          instructions: bidInstructions,
          signers: bidSigners,
        },
      };

      let signers = [lookup.payTax.signers, lookup.placeBid.signers];
      let toRemoveSigners: any = [];
      let instructions = [
        lookup.payTax.instructions,
        lookup.placeBid.instructions,
      ].filter((instr, i) => {
        if (instr.length > 0) {
          return true;
        } else {
          toRemoveSigners[i] = true;
          return false;
        }
      });

      let filteredSigners = signers.filter((_, i) => !toRemoveSigners[i]);
      const txs = await sendTransactionsSmart(
        connection,
        wallet,
        instructions,
        filteredSigners,
        "single"
      );

      if (!txs.isAllSuccess) {
        dispatch(setMessage("Something went wrong"));
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        return;
      }
      await dispatch(
        placeBid({
          auctionId: auctionData._id,
          auction: auctionData.auction,
          store: auctionData.storeId,
          price: bidAmount,
          txId: txs.txList[1],
          status: "pending",
          bidderMeta: bidderMeta.toBase58(),
          bidderPotToken: bidderPotToken.toBase58(),
        })
      );
      dispatch(setMessage("You bid has been placed"));
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(true));

      await dispatch(
        userPaymentAction(
          nftDetails?._id,
          null,
          currentUser.id,
          systemSetting?.makeAnOfferPiqsolFee,
          txs.txList[0],
          "bid"
        )
      );
      closeMakeOfferModal();
      setBuyNftLoader(false);
    } catch (error) {
      console.log("make an offer error", error);

      dispatch(
        setMessage(
          "There is something wrong please try again later" +
            extractErrorMessage(error)
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));

      setBuyNftLoader(false);
    }
  };

  const claimPrice = async () => {
    if (buyNftLoader) return true;
    try {
      setBuyNftLoader(true);

      const auctionManagerPDA = await programs.metaplex.AuctionManager.getPDA(
        new PublicKey(auctionData.auction)
      );

      const auctionManagerLoad = await programs.metaplex.AuctionManager.load(
        connection,
        auctionManagerPDA
      );
      const auctionLoaded = await programs.auction.Auction.load(
        connection,
        new PublicKey(auctionData.auction)
      );

      let {
        instructions: emptyPaymentAccountInstructions,
        signers: emptyPaymentAccountSigners,
        wrappedSolAccs,
        ataOwnerDict,
      } = await emptyPaymentAccountFunc({
        connection,
        vault: new PublicKey(auctionData.vaultId),
        wallet,
        tokenMint: new PublicKey(nftDetails.mint),
        acceptPaymentAcc: auctionManagerLoad.data.acceptPayment,
        nftMetadata: nftDetails.metadata,
        store: new PublicKey(storeKey),
        tokenTracker: auctionData.tokenTracker,
      });

      let { instructions: closeAccInstruction, signers: closeAccSigner } =
        await closeAssociatedAccountInstruction({
          associatedAcc: new PublicKey(
            ataOwnerDict[wallet.publicKey.toBase58()]
          ),
          wallet: wallet,
        });

      const lookup = {
        emptyAccount: {
          instructions: emptyPaymentAccountInstructions,
          signers: emptyPaymentAccountSigners,
        },
        closeAccount: {
          instructions: closeAccInstruction,
          signers: closeAccSigner,
        },
      };

      let signers = [lookup.emptyAccount.signers, lookup.closeAccount.signers];
      let toRemoveSigners: any = [];
      let instructions = [
        lookup.emptyAccount.instructions,
        lookup.closeAccount.instructions,
      ].filter((instr, i) => {
        if (instr.length > 0) {
          return true;
        } else {
          toRemoveSigners[i] = true;
          return false;
        }
      });

      let filteredSigners = signers.filter((_, i) => !toRemoveSigners[i]);
      await sendTransactions(
        connection,
        wallet,
        instructions,
        filteredSigners,
        "single"
      );

      var cur_price = auctionBids[0]?.price || auctionData?.auctionPrice;
      await dispatch(
        updateAuction(auctionData._id, {
          nftId: nftDetails._id,
          userId: currentUser.id,
          price: cur_price,
          status: "end",
        })
      );
      reNavigate();
      setBuyNftLoader(false);
    } catch (error) {
      console.log("claim price error", error);

      dispatch(setMessage("There is something wrong please try again later"));
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));

      setBuyNftLoader(false);
    }
  };

  const fetchRefundBid = async () => {
    if (auctionOpenState.bidId) {
      const refundBid = await dispatch(getBid(auctionOpenState.bidId));
      setRefundBid(refundBid);
    }
  };

  const getPrices = async () => {
    const priceInSol = getCurrentPrice(auctionData, nftDetails, auctionBids);
    setCurrentPriceInSol(priceInSol);
    const priceInUSD = await getCurrentPriceInUSD(priceInSol, auctionData);
    setCurrentPriceInUSD(priceInUSD);
  };

  React.useEffect(() => {
    if (auctionData) {
      getPrices();
      setBidAmount(Number(auctionData?.auctionPrice));
      fetchRefundBid();
    }
    if (auctionData?._id && nftDetails?._id) {
      getPrices();
    }
  }, [auctionData?._id, nftDetails?._id]);

  const fetchUserBalance = async () => {
    const { userPiqsolBalance: userPQLBalance }: any = await getUserBalance(
      currentUser?.chainType,
      wallet
    );
    setUserPQLBalance(userPQLBalance);
    return userPQLBalance;
  };

  React.useEffect(() => {
    if (wallet.connected || currentUser?.id) {
      getPrices();
      fetchUserBalance();
    } else {
      wallet.connect();
    }
  }, [wallet, currentUser?.id]);

  const onBidAmountChange = (value: number) => {
    setPriceUptoThreeDecimal(value, setBidAmount);
  };

  const handlerRefundBid = async () => {
    if (buyNftLoader) return true;
    try {
      setBuyNftLoader(true);
      const bidToCancel = auctionBids.find(
        (bid: any) =>
          bid._id == auctionOpenState.bidId && bid.status === "pending"
      );
      const { instructions: bidCancelInstruction, signers: bidCancelSinger } =
        await cancelBidInstraction({
          connection,
          wallet,
          auction: new PublicKey(auctionData.auction),
          bidderPotToken: new PublicKey(bidToCancel.bidderPotToken),
        });
      const lookup = {
        cancelBid: {
          instructions: bidCancelInstruction,
          signers: bidCancelSinger,
        },
      };

      let signers = [lookup.cancelBid.signers];
      let toRemoveSigners: any = [];
      let instructions = [lookup.cancelBid.instructions].filter((instr, i) => {
        if (instr.length > 0) {
          return true;
        } else {
          toRemoveSigners[i] = true;
          return false;
        }
      });

      let filteredSigners = signers.filter((_, i) => !toRemoveSigners[i]);
      const txs = await sendTransactions(
        connection,
        wallet,
        instructions,
        filteredSigners,
        "single"
      );
      await dispatch(
        updateBid(bidToCancel?._id, {
          status: "refunded",
        })
      );
      dispatch(updateNotification(auctionOpenState._id, { isSeen: true }));
      setBuyNftLoader(false);
      reNavigate();
    } catch (error) {
      dispatch(
        setMessage(
          "There is something wrong please try again later" +
            extractErrorMessage(error)
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));

      setBuyNftLoader(false);
    }
  };

  const checkUserBalance = async (amount, pqlAmount) => {
    const userBalance = await getUserBalance(currentUser?.chainType, wallet);
    const totalPayable: any = Number(amount);

    if (
      Number(totalPayable) > Number(userBalance.userNativeBalance) ||
      pqlAmount > userBalance.userPiqsolBalance
    ) {
      dispatch(
        setMessage(
          "You don't have enough PiqSol Tokens or SOL, please recharge"
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));

      setBuyNftLoader(false);
      return false;
    }
    return true;
  };

  const handlerCancelListing = async () => {
    try {
      if (buyNftLoader) return true;

      setBuyNftLoader(true);
      if (
        auctionData?.blockchainType.toLowerCase() !==
        currentUser?.chainType?.toLowerCase()
      ) {
        dispatch(
          setMessage(
            `You're on wrong chain please switch your chain to ${
              CHAIN_TITLE[auctionData?.blockchainType?.toLowerCase()]
            }`
          )
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        return;
      }

      if (auctionData) {
        if (auctionData?.blockchainType?.toLowerCase() !== "solana") {
          if (auctionData?.auctionType === "fractional") {
            const responseOfCancelFnFT = await cancelListingFnFT(
              nftDetails?.contractAddress,
              parseInt(nftDetails?.tokenId)
            );

            if (
              responseOfCancelFnFT?.status &&
              responseOfCancelFnFT?.transactionHash
            ) {
              dispatch(setMessage(`Cancel listing is Successfull`));
              dispatch(setIsOpen(true));
              dispatch(setIsSuccess(true));

              await dispatch(
                updateAuction(auctionData._id, {
                  status: "cancelled",
                  nftId: nftDetails._id,
                  userId: currentUser.id,
                  price: auctionData.auctionPrice,
                  txnHash: responseOfCancelFnFT?.transactionHash,
                })
              );
              navigate(`/${currentUser?.id}/myCollected`);
              return;
            }

            return;
          }

          let cancelListingOfAuctions = undefined;

          if (auctionData?.auctionType === "fixedPrice") {
            cancelListingOfAuctions = await cancelListingsOfFixedPrice(
              auctionData?.marketplaceItemId,
              "canclelistOfFixedItem"
            );
          }
          if (auctionData?.auctionType === "highestBid") {
            cancelListingOfAuctions = await cancelListingsOfFixedPrice(
              auctionData?.marketplaceItemId,
              "canclelistOfAuctionItem"
            );
          }
          if (
            cancelListingOfAuctions?.status &&
            cancelListingOfAuctions?.transactionHash
          ) {
            dispatch(setMessage(`Cancel listing is Successfull`));
            dispatch(setIsOpen(true));
            dispatch(setIsSuccess(true));

            await dispatch(
              updateAuction(auctionData._id, {
                status: "cancelled",
                nftId: nftDetails._id,
                userId: currentUser.id,
                price: auctionData.auctionPrice,
                txnHash: cancelListingOfAuctions?.transactionHash,
              })
            );
            navigate(`/${currentUser?.id}/myCollected`);
            return;
          }

          if (!cancelListingOfAuctions) {
            dispatch(setMessage(`Something went wrong while unlisting NFT`));
            dispatch(setIsOpen(true));
            dispatch(setIsSuccess(false));
            return;
          }
        }

        // end Auction
        const {
          instructions: endAuctionInstructions,
          signers: endAuctionSigners,
        } = await getEndAuctionInstructions({
          connection,
          auction: new PublicKey(auctionData.auction),
          store: storeKey,
          wallet,
        });

        const {
          instructions: redeemInstructions,
          signers: redeemSigners,
          tokenAccount,
        } = await redeemNFTInstruction({
          connection,
          bidderWallet: wallet,
          auction: new PublicKey(auctionData.auction),
          store: storeKey,
        });

        const { isAllSuccess, txList }: any = await sendTransactionsSmart(
          connection,
          wallet,
          [redeemInstructions, endAuctionInstructions],
          [redeemSigners, endAuctionSigners],
          "single"
        );
        if (!isAllSuccess) {
          dispatch(setMessage("Something went wrong while paying tax"));
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(false));
          return;
        }

        if (isAllSuccess) {
          dispatch(setMessage("Cancel listing is Successfull"));
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(true));

          await dispatch(
            updateAuction(auctionData._id, {
              status: "cancelled",
              nftId: nftDetails._id,
              userId: currentUser.id,
              price: auctionData.auctionPrice,
            })
          );

          navigate(`/${currentUser?.id}/myCollected`);
        }
        return;
      }
      dispatch(setMessage(`No auction data found`));
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
      return;
    } catch (err) {
      console.log(
        "🚀 ~ file: MetaInfo.tsx ~ line 1653 ~ handlerCancelListing ~ err",
        err
      );
      dispatch(setMessage(`Something went wrong ${extractErrorMessage(err)}`));
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
      return false;
    } finally {
      setBuyNftLoader(false);
    }
  };

  const reclaimNftHandler = async () => {
    try {
      setBuyNftLoader(true);
      const auctionManager = new PublicKey(auctionData.auctionManager);
      const data = await programs.metaplex.AuctionManager.load(
        connection,
        auctionManager
      );
      const store = data.data.store;
      const auctionPubkey = new PublicKey(data.data.auction);

      const refundBidInstructions = await placeBidInstruction({
        connection,
        bidderWallet: wallet,
        amount: new BN(0),
        auction: auctionPubkey,
        taxFee: new BN(0),
      });

      if (refundBidInstructions === -1) {
        setBuyNftLoader(false);
        dispatch(
          setMessage(
            "You must have sol and piqsol token in your wallet for this action"
          )
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        return;
      }

      const {
        instructions: placebidInstructions,
        signers: placeBidSigners,
        bidderPotToken,
        bidderMeta,
      }: any = refundBidInstructions;

      let {
        instructions: redeemInstructions,
        signers: redeemSigners,
        tokenAccount,
      } = await reclaimNFTInstruction({
        connection,
        bidderWallet: wallet,
        auction: auctionPubkey,
        store: new PublicKey(store),
      });

      const lookup = {
        placeBid: {
          instructions: placebidInstructions,
          signers: placeBidSigners,
        },
        reclaimNft: {
          instructions: redeemInstructions,
          signers: redeemSigners,
        },
      };

      let signers = [lookup.placeBid.signers, lookup.reclaimNft.signers];
      let toRemoveSigners: any = [];
      let instructions = [
        lookup.placeBid.instructions,
        lookup.reclaimNft.instructions,
      ].filter((instr, i) => {
        if (instr.length > 0) {
          return true;
        } else {
          toRemoveSigners[i] = true;
          return false;
        }
      });

      let filteredSigners = signers.filter((_, i) => !toRemoveSigners[i]);

      const transactionIds = await sendTransactions(
        connection,
        wallet,
        instructions,
        filteredSigners,
        "single"
      );

      if (transactionIds?.length) {
        await dispatch(
          updateAuction(auctionData?._id, {
            ...auctionData,
            status: "end",
            reclaim: true,
          })
        );
        navigate("/explore");
      }
    } catch (err) {
      console.log("error reclaiming nft:", err);
      dispatch(
        setMessage(
          "There is something wrong please try again later" +
            extractErrorMessage(err)
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
    } finally {
      setBuyNftLoader(false);
    }
  };

  const removeItemFromPiqsol = async () => {
    setRemoveNftLoading(true);

    const nftUData: any = await dispatch(
      updateNft(nftDetails?._id, { isActive: false })
    );
    if (nftUData) {
      dispatch(setMessage("You nft has been removed from piqsol"));
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(true));

      await sleep(3000);
      navigate("/explore");
    }
    setRemoveNftLoading(true);
  };

  return (
    <Box className={Classes.metaInfoWrapper}>
      <WalletModal isVisible={isVisible} onClose={() => setIsVisible(false)} />

      <BuyNowModal
        userPQLbalance={userPQLbalance}
        openModal={open}
        closeModal={closeBuyNowModal}
        buyNftHandler={buyNftHandler}
        auctionData={auctionData}
        mintedFractionDetails={mintedFractionDetails}
        nftData={nftDetails}
        buyNftLoader={buyNftLoader}
        connection={connection}
        wallet={wallet}
      />
      <MakeOfferModal
        userPQLbalance={userPQLbalance}
        buyNftLoader={buyNftLoader}
        openModal={openMakeOfferModal}
        auctionData={auctionData}
        closeModal={closeMakeOfferModal}
        bidAmount={bidAmount}
        onBidAmountChange={onBidAmountChange}
        makeAnOfferHandler={makeAnOfferHandler}
      />

      <Box sx={{ display: { xs: "none", lg: "block" } }}>
        <NftInfo nftDetails={nftDetails} />
      </Box>

      {auctionData &&
        auctionData?.auctionType === "highestBid" &&
        auctionData?.status === "active" && (
          <CountDown date={moment(auctionData?.endDateTime).toDate()} />
        )}

      {currentUser &&
        auctionData &&
        auctionData?.status === "active" &&
        auctionData?.userId === currentUser?.id &&
        auctionData?.auctionType === "fractional" &&
        !isFractionSold &&
        !selectedFraction && (
          <CardBox className={Classes.priceSection}>
            <Grid container spacing={2} className={Classes.actionArea}>
              <Grid item xs={12}>
                <Button
                  // disabled={buyNftLoader}
                  onClick={handlerCancelListing}
                  variant="contained"
                  className={`gradientButton ${Classes.buynowBtn}`}
                  startIcon={
                    <img
                      src={WalletIcon}
                      alt="WalletIcon"
                      style={{ height: "18px" }}
                    />
                  }
                >
                  {buyNftLoader ? "Please wait" : "Cancel Listing"}
                  {buyNftLoader && (
                    <CircularProgress
                      style={{ color: "white", marginLeft: 10 }}
                      size={16}
                    />
                  )}
                  <div className="fill-two"></div>
                </Button>
              </Grid>
            </Grid>
          </CardBox>
        )}

      {auctionData && auctionData?.auctionType !== "fractional" && (
        <CardBox className={Classes.priceSection}>
          <Typography className={Classes.title}>Current price</Typography>
          <Typography component="div" className={Classes.priceInfo}>
            <img
              loading="lazy"
              src={CHAIN_LOGOS[auctionData?.blockchainType || "Solana"]}
              alt="logo"
              className={Classes.logo}
            />
            <Typography className={Classes.pricingCount}>
              <Typography className={Classes.price}>
                {getConvertedDecimalPrice(currentPriceInSol)}
              </Typography>
              <Typography className={Classes.priceCount}>
                {`($${getConvertedDecimalPrice(currentPriceInUSD)})`}
              </Typography>
            </Typography>
          </Typography>

          {currentUser &&
            auctionData &&
            auctionData?.status === "active" &&
            auctionData?.userId === currentUser?.id &&
            ((auctionData?.auctionType === "highestBid" &&
              auctionData?.bids?.length === 0) ||
              auctionData?.auctionType === "fixedPrice") && (
              <Grid container spacing={2} className={Classes.actionArea}>
                <Grid item xs={12}>
                  <Button
                    // disabled={buyNftLoader}
                    onClick={handlerCancelListing}
                    variant="contained"
                    className={`gradientButton ${Classes.buynowBtn}`}
                    startIcon={
                      <img
                        src={WalletIcon}
                        alt="WalletIcon"
                        style={{ height: "18px" }}
                      />
                    }
                  >
                    {buyNftLoader ? "Please wait" : "Cancel Listing"}
                    {buyNftLoader && (
                      <CircularProgress
                        style={{ color: "white", marginLeft: 10 }}
                        size={16}
                      />
                    )}
                    <div className="fill-two"></div>
                  </Button>
                </Grid>
              </Grid>
            )}

          {currentUser &&
            refundBid &&
            auctionData &&
            auctionData.blockchainType === "solana" &&
            auctionOpenState &&
            auctionOpenState?.type === "refundBid" &&
            refundBid.status === "pending" && (
              <Grid container spacing={2} className={Classes.actionArea}>
                <Grid item xs={12}>
                  <Button
                    onClick={handlerRefundBid}
                    variant="contained"
                    className={`gradientButton ${Classes.buynowBtn}`}
                    startIcon={
                      <img
                        src={WalletIcon}
                        alt="WalletIcon"
                        style={{ height: "18px" }}
                      />
                    }
                  >
                    {buyNftLoader ? "Please wait" : "Refund your bid"}
                    {buyNftLoader && (
                      <CircularProgress
                        style={{ color: "white", marginLeft: 10 }}
                        size={16}
                      />
                    )}
                    <div className="fill-two"></div>
                  </Button>
                </Grid>
              </Grid>
            )}

          {auctionData &&
            auctionData?.status !== "end" &&
            !auctionEnded &&
            currentUser?.id !== auctionData?.userId &&
            auctionData.status === "active" && (
              <Grid container spacing={2} className={Classes.actionArea}>
                {auctionData.auctionType === "fixedPrice" ? (
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      className={`gradientButton ${Classes.buynowBtn}`}
                      startIcon={
                        <img
                          src={WalletIcon}
                          alt="WalletIcon"
                          style={{ height: "18px" }}
                        />
                      }
                      onClick={openBuyNowModal}
                    >
                      Buy Now
                      <div className="fill-two"></div>
                    </Button>
                  </Grid>
                ) : (
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      className={Classes.offerBtn}
                      startIcon={<LocalOfferOutlinedIcon />}
                      onClick={showMakeOfferModal}
                    >
                      Make Offer
                    </Button>
                  </Grid>
                )}
              </Grid>
            )}

          {currentUser &&
            auctionData &&
            auctionData.status !== "end" &&
            ((auctionData?.auctionType === "highestBid" &&
              auctionBids.length > 0) ||
              auctionData.auctionType === "fixedPrice") &&
            currentUser?.id === auctionData?.userId &&
            (auctionState === 2 || auctionData?.status === "claimPrice") && (
              <Grid container spacing={2} className={Classes.actionArea}>
                <Grid item xs={12}>
                  <Button
                    onClick={claimPrice}
                    variant="contained"
                    className={Classes.offerBtn}
                    startIcon={<LocalOfferOutlinedIcon />}
                  >
                    {buyNftLoader
                      ? "Please wait"
                      : "Your NFT is Sold. Claim your Funds"}
                    {buyNftLoader && (
                      <CircularProgress
                        style={{ color: "white", marginLeft: 10 }}
                        size={16}
                      />
                    )}
                  </Button>
                  {buyNftLoader && (
                    <Typography
                      sx={{ color: "var(--text-color)" }}
                      className={`warning-msg ${Classes.actionMsg}`}
                    >
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="color-red"
                      />{" "}
                      Don't close the window.
                    </Typography>
                  )}
                </Grid>
              </Grid>
            )}

          {currentUser &&
            auctionData &&
            auctionEnded &&
            auctionData?.status !== "end" &&
            auctionData.blockchainType === "solana" &&
            auctionData?.bids?.length === 0 &&
            auctionData?.auctionType === "highestBid" &&
            currentUser?.id === auctionData?.userId && (
              <Grid container spacing={2} className={Classes.actionArea}>
                <Grid item xs={12}>
                  <Button
                    onClick={reclaimNftHandler}
                    variant="contained"
                    className={Classes.offerBtn}
                    startIcon={<LocalOfferOutlinedIcon />}
                  >
                    {buyNftLoader ? "Please wait" : "Reclaim NFT"}
                    {buyNftLoader && (
                      <CircularProgress
                        style={{ color: "white", marginLeft: 10 }}
                        size={16}
                      />
                    )}
                  </Button>
                  {buyNftLoader && (
                    <Typography
                      sx={{ color: "var(--text-color)" }}
                      className={`warning-msg ${Classes.actionMsg}`}
                    >
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="color-red"
                      />{" "}
                      Don't close the window.
                    </Typography>
                  )}
                </Grid>
              </Grid>
            )}

          {currentUser &&
            auctionData &&
            auctionEnded &&
            auctionData.status !== "end" &&
            auctionData.blockchainType === "solana" &&
            (auctionState === 1 || auctionData.status === "claimNft") &&
            wallet?.publicKey?.toBase58() === auctionWinnerKey && (
              <Grid container spacing={2} className={Classes.actionArea}>
                <Grid item xs={12}>
                  <Button
                    onClick={claimNftHandler}
                    variant="contained"
                    className={Classes.offerBtn}
                    startIcon={<LocalOfferOutlinedIcon />}
                  >
                    {buyNftLoader ? "Please wait" : "Claim NFT"}
                    {buyNftLoader && (
                      <CircularProgress
                        style={{ color: "white", marginLeft: 10 }}
                        size={16}
                      />
                    )}
                  </Button>
                </Grid>
              </Grid>
            )}
        </CardBox>
      )}

      {currentUser &&
        auctionData &&
        auctionData.status !== "end" &&
        currentUser.id === auctionData.userId &&
        auctionData.blockchainType?.toLowerCase() !== "solana" &&
        (auctionState === 1 ||
          auctionData.status === "claimNft" ||
          auctionData.status === "reClaimNft" ||
          auctionEnded) &&
        wallet?.publicKey?.toBase58() === auctionWinnerKey && (
          <CardBox className={Classes.priceSection}>
            <Grid container spacing={2} className={Classes.actionArea}>
              <Grid item xs={12}>
                <Button
                  disabled={buyNftLoader}
                  onClick={endYourAuction}
                  variant="contained"
                  className={Classes.offerBtn}
                  startIcon={<LocalOfferOutlinedIcon />}
                >
                  {buyNftLoader ? "Please wait" : "End Your Auction"}
                  {buyNftLoader && (
                    <CircularProgress
                      style={{ color: "white", marginLeft: 10 }}
                      size={16}
                    />
                  )}
                </Button>
              </Grid>
            </Grid>
          </CardBox>
        )}

      {nftDetails &&
        currentUser &&
        nftDetails?.userId?._id === currentUser?.id &&
        (auctionData?.status === "claimPrice" || !auctionData) && (
          <CardBox className={Classes.priceSection}>
            <Grid container spacing={2} className={Classes.actionArea}>
              <Grid item xs={12}>
                <Link
                  to={`/listItemForSale/${nftDetails?._id}`}
                  style={{ textDecoration: "none" }}
                >
                  <Button variant="contained" className={Classes.actionBtn}>
                    List To Sell
                  </Button>
                </Link>
              </Grid>
            </Grid>
            <Grid container spacing={2} className={Classes.actionArea}>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  onClick={removeItemFromPiqsol}
                  className={Classes.borderBlueBtn}
                >
                  {removeNftLoading ? "Please wait" : "Remove from Piqsol"}
                  {removeNftLoading && (
                    <CircularProgress style={{ marginLeft: 10 }} size={16} />
                  )}
                </Button>
              </Grid>
            </Grid>
          </CardBox>
        )}
      {auctionData && auctionData?.auctionType === "fractional" && (
        <>
          {auctionData?.fractionDimensions?.length > 0 && !selectedFraction && (
            <CardBox className={Classes.nftBlockSelectionBlock}>
              <NftBlockSelection blocksCount={auctionData?.noOfFractions} />
            </CardBox>
          )}
          {auctionData?.auctionType === "fractional" &&
            auctionData?.fractionDimensions?.length > 0 &&
            selectedFraction && (
              <VideoMetaInfo
                onFetchDetails={onFetchDetails}
                onClearSelection={onClearSelection}
                auctionData={auctionData}
                selectedFraction={selectedFraction}
                selectedFractionDetails={mintedFractionDetails}
                nftDetails={nftDetails}
                openFractionBuyNowModal={openBuyNowModal}
                userPQLBalance={userPQLbalance}
              />
            )}
        </>
      )}
    </Box>
  );
};

export default MetaInfo;
