import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Classes from "../../style/ListItemForSale/NFTSummary.module.scss";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import { Connection, programs } from "@metaplex/js";
import { endpoint } from "../../utils/helpers/getChainNetwork";
import { useWallet } from "@solana/wallet-adapter-react";

import BN from "bn.js";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useDispatch, useSelector } from "react-redux";
import { createAuctionAction } from "store/reducers/auctionReducer";

import {
  createExternalPriceTransaction,
  createVaultTransaction,
  createAddNftToVaultInstruction,
  createCloseVaultInstruction,
  createAuctionInstruction,
  createAuctionManagerInstruction,
  updateVaultAndAuctionAuthority,
  validateAuctionInstruction,
  startAuctionInstruction,
} from "../../utils/helpers/auctionWithInstructionUtils";

import { payTax } from "../../utils/helpers/customTokenAuctionUtils";
////////////////////////////////

import { sendTransactionsSmart } from "../../utils/helpers/auctionTransactionHelper";
import { getUserBalance } from "utils/helpers/getUserBalance";
import { userPaymentAction } from "store/reducers/messageReducer";
import { createVaultAddNFT } from "utils/helpers/vaultUtils";
import ScrollToTop from "pages/ScrollToTop";
import { getWeb3 } from "../../web3/web3";
import {
  initContract,
  listItemForFixedPrice,
  listItemForAuction,
  sendFranctionAuctionNftToContract,
} from "../../web3/contractHelpers";
import {
  MINTING_CONTRACTS_DETAILS,
  MARKETPLACE_CONTRACT_ADDRESS,
  COMMON_CONTRACT_ABI,
} from "../../web3/config";
import {
  CHAIN_CURRENCY,
  extractErrorMessage,
  getConvertedDecimalPrice,
} from "components/common/helpers/helpers";

import {
  setIsOpen,
  setIsSuccess,
  setMessage,
} from "store/reducers/errorSuccessMessageReducer";

const {
  metaplex: { AuctionManager },
  vault: { Vault },
} = programs;

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

const NFTSummary = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wallet: any = useWallet();
  const connection: Connection = new Connection(endpoint.url);
  const [loading, setLoading] = useState<boolean>(false);
  const [auctionCreatedData, setAuctionCreatedData] = useState<any>({});

  const currentUser = useSelector(
    (state: any) => state.authReducer.currentUser
  );
  const systemSetting = useSelector(
    (state: any) => state.systemSettingReducer.systemSettings
  );

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  const checkUserBalance = async (systemSetting) => {
    const userBalance = await getUserBalance(currentUser?.chainType, wallet);
    if (systemSetting?.mintPiqsolFee > userBalance.userPiqsolBalance) {
      dispatch(
        setMessage(
          "You don't have enough PiqSol Tokens or SOL, please recharge"
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));

      setLoading(false);
      return false;
    }
    return true;
  };

  const fetchUserBalance = async () => {
    const { userPiqsolBalance: userPQLBalance } = await getUserBalance(
      currentUser?.chainType,
      wallet
    );
    return userPQLBalance;
  };

  useEffect(() => {
    if (wallet.publicKey) {
      fetchUserBalance();
    }
  }, [wallet, , auctionCreatedData]);

  // TODO fetch user balance for metamask wallet

  useEffect(() => {
    const auctionData: any = JSON.parse(
      localStorage.getItem("auctionCreateData") || ""
    );

    setAuctionCreatedData(auctionData);
  }, []);

  const toPublicKey = (key: any) => new PublicKey(key);

  const storeKey = new PublicKey(process.env.REACT_APP_METAPLEX_STORE_ID || "");

  const createAuction = async () => {
    if (loading) return true;
    try {
      setLoading(true);
      if (currentUser?.chainType?.toLowerCase() !== "solana") {
        let listingNFTForSale = undefined;
        let startTime = new Date().getTime();
        let endTime = startTime + auctionCreatedData?.secondsDuration * 1000;

        const web3 = await getWeb3();

        const chainId = await web3.eth.getChainId();

        const contractDetails = MARKETPLACE_CONTRACT_ADDRESS[chainId];
        let mintingContractDetails = MINTING_CONTRACTS_DETAILS[chainId];
        const contract = initContract(
          web3,
          contractDetails.contractABI,
          contractDetails.address
        );
        const { nftData } = auctionCreatedData;
        let mintingContract = initContract(
          web3,
          mintingContractDetails?.contractABI,
          mintingContractDetails?.address
        );
        if (nftData?.contractAddress !== mintingContractDetails?.address) {
          mintingContractDetails = {
            contractABI: COMMON_CONTRACT_ABI.contractABI,
            address: nftData?.contractAddress,
          };
          mintingContract = initContract(
            web3,
            mintingContractDetails?.contractABI,
            mintingContractDetails?.address
          );
        }

        if (auctionCreatedData?.auctionType === "fractional") {
          dispatch(setMessage("Fractional NFT listing - Coming Soon"));
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(true));

          return;
        }

        if (auctionCreatedData?.auctionType === "fixedPrice") {
          const { nftPrice } = auctionCreatedData;

          const royaltiesAddress =
            nftData?.creators?.length > 0
              ? nftData?.creators[0]?.address
              : "0x0000000000000000000000000000000000000000";

          listingNFTForSale = await listItemForFixedPrice(
            web3,
            contract,
            mintingContract,
            {
              tokenId: nftData?.tokenId,
              price: nftPrice,
              royaltiesAddress,
              percentageBasisPoints: nftData?.seller_fee_basis_points || 0,
            },
            contractDetails.address,
            nftData.contractAddress,
            systemSetting?.listingItemTax || 0
          );

          if (listingNFTForSale === -2) {
            setLoading(false);
            dispatch(
              setMessage(
                "You don't have PQL tokens or there is something went wrong while fetching your balance"
              )
            );
            dispatch(setIsOpen(true));
            dispatch(setIsSuccess(false));
            return;
          }

          if (listingNFTForSale == false) {
            setLoading(false);

            dispatch(setMessage("Approval for tax paying is required"));
            dispatch(setIsOpen(true));
            dispatch(setIsSuccess(false));

            return;
          }
        }

        if (auctionCreatedData?.auctionType === "highestBid") {
          const royaltiesAddress =
            nftData?.creators?.length > 0
              ? nftData?.creators[0]?.address
              : "0x0000000000000000000000000000000000000000";
          // TODO: Tax Deduction Here for Auctions
          listingNFTForSale = await listItemForAuction(
            web3,
            contract,
            mintingContract,
            contractDetails.address,
            nftData?.contractAddress,
            {
              tokenId: nftData?.tokenId,
              endTime: auctionCreatedData?.secondsDuration,
              price: auctionCreatedData?.auctionPrice || 0,
              royaltiesAddress,
              percentageBasisPoints: nftData?.seller_fee_basis_points || 0,
            },
            systemSetting?.listingItemTax || 0
          );

          if (listingNFTForSale === -2) {
            setLoading(false);
            dispatch(
              setMessage(
                "You don't have PQL tokens or there is something went wrong while fetching your balance"
              )
            );
            dispatch(setIsOpen(true));
            dispatch(setIsSuccess(false));
            return;
          }

          if (listingNFTForSale == false) {
            setLoading(false);
            dispatch(setMessage("Approval for tax paying is required"));
            dispatch(setIsOpen(true));
            dispatch(setIsSuccess(false));
            return;
          }
        }

        if (listingNFTForSale === -1) {
          setLoading(false);
          dispatch(setMessage("You don't have approval for NFT to sale"));
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(false));
          return;
        }

        if (!listingNFTForSale) {
          setLoading(false);
          dispatch(setMessage("Something went wrong"));
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(false));
          return;
        }

        const auctionData: any = await dispatch(
          createAuctionAction({
            nftId: auctionCreatedData?.nftData._id,
            mint: auctionCreatedData?.nftData.mint,
            status: "active",
            creatorNftRights: auctionCreatedData?.creatorNftRights,
            blockchainType: auctionCreatedData?.selectedBlockchain,
            auctionPrice: auctionCreatedData?.nftPrice,
            royaltyFee: auctionCreatedData?.royaltyFee,
            tokenId: nftData?.tokenId,
            marketplaceItemId:
              listingNFTForSale?.events?.itemAdded?.returnValues?.id,
            endDateTime:
              auctionCreatedData?.auctionType === "highestBid"
                ? new Date(endTime)
                : undefined,
            displayStreaming: auctionCreatedData?.displayStreaming,
            physicalReproduction: auctionCreatedData?.physicalReproduction,
            auctionType: auctionCreatedData?.auctionType,
            collectionId: auctionCreatedData?.nftData?.collectionId,
          })
        );

        if (auctionData?._id) {
          dispatch(setMessage("NFT listed Successfully"));
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(true));

          navigate(
            `/explore/explore-details/${auctionCreatedData?.nftData._id}`
          );
          return;
        }
      }

      const userBalanceAva = await checkUserBalance(systemSetting);

      if (!userBalanceAva) {
        return false;
      }
      const storeLoaded = await programs.metaplex.Store.load(
        connection,
        storeKey
      );
      const nft_key = auctionCreatedData.nftData?.mint;
      const responsePayTax = await payTax(
        {
          connection,
          wallet,
          transactionAmount: systemSetting?.mintPiqsolFee,
        },
        currentUser
      );

      if (responsePayTax === -1) {
        setLoading(false);
        dispatch(
          setMessage(
            "You must have sol and piqsol token in your wallet for this action"
          )
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        return;
      }

      const { instructions: taxInstructions, signers: taxSigners }: any =
        responsePayTax;
      let {
        externalPriceAccount,
        priceMint,
        signers: epaSigners,
        instructions: epaInstructions,
      } = await createExternalPriceTransaction({ connection, wallet });

      let {
        vault,
        fractionMint,
        redeemTreasury,
        fractionTreasury,
        instructions: createVaultInstructions,
        signers: createVaultSigners,
      } = await createVaultTransaction({
        connection,
        externalPriceAccount,
        wallet,
      });

      let {
        instructions: addToVaultInstructions,
        signers: addToVaultSigners,
        tokenStoreAccount: tokenStoreAccount,
      } = await createAddNftToVaultInstruction({
        vault,
        nftKey: nft_key,
        wallet,
      });

      let { instructions: closeVaultInstructions, signers: closeVaultSigners } =
        await createCloseVaultInstruction({
          vault,
          wallet,
          fractionMint,
          fractionTreasury,
          redeemTreasury,
          pricingLookupAddress: externalPriceAccount,
        });

      let {
        instructions: createAuctionInstructions,
        signers: createAuctionSigners,
        auction,
        auctionExtended,
      } = await createAuctionInstruction({
        wallet,
        vault,
        endAuctionAt: null,
        price: new BN(auctionCreatedData?.nftPrice * LAMPORTS_PER_SOL),
        isInstantSale: auctionCreatedData?.auctionType === "fixedPrice",
        secondsDuration: auctionCreatedData?.secondsDuration,
      });

      let {
        instructions: createAuctionManagerInstructions,
        signers: createAuctionManagerSigners,
        auctionManager,
        tokenTracker,
        acceptPaymentAccount,
      } = await createAuctionManagerInstruction({
        wallet,
        vault,
        store: storeKey,
        auction,
      });

      let {
        instructions: setVaultAndAucInstructions,
        signers: setVaultAndAucSigners,
      } = await updateVaultAndAuctionAuthority({
        wallet,
        auction,
        vault,
        auctionManager,
      });

      const metadataPDA = await programs.metadata.Metadata.getPDA(
        toPublicKey(auctionCreatedData?.nftData?.mint || "")
      );
      let {
        instructions: validateAuctionInstructions,
        signers: validateAuctionSigners,
      } = await validateAuctionInstruction({
        wallet,
        vault,
        nft: toPublicKey(nft_key),
        store: storeKey,
        metadata: metadataPDA,
        tokenStore: tokenStoreAccount,
        tokenTracker,
      });

      let {
        instructions: startAuctionInstructions,
        signers: startAuctionSigners,
      } = await startAuctionInstruction({
        wallet,
        store: storeKey,
        auction,
        auctionManager,
      });

      //////////////////////////////////////////////////////////////
      //////////////////////Sending transactions////////////////////
      //////////////////////////////////////////////////////////////
      let lookup = {
        taxPayment: {
          instructions: taxInstructions,
          signers: taxSigners,
        },
        externalPriceAccount: {
          instructions: epaInstructions,
          signers: epaSigners,
        },
        createVault: {
          instructions: createVaultInstructions,
          signers: createVaultSigners,
        },
        addTokens: {
          instructions: addToVaultInstructions,
          signers: addToVaultSigners,
        },
        closeVault: {
          instructions: closeVaultInstructions,
          signers: closeVaultSigners,
        },
        makeAuction: {
          instructions: createAuctionInstructions,
          signers: createAuctionSigners,
        },
        initAuctionManager: {
          instructions: createAuctionManagerInstructions,
          signers: createAuctionManagerSigners,
        },

        setVaultAndAuctionAuthority: {
          instructions: setVaultAndAucInstructions,
          signers: setVaultAndAucSigners,
        },
        validateBoxes: {
          instructions: validateAuctionInstructions,
          signers: validateAuctionSigners,
        },
        startAuction: {
          instructions: startAuctionInstructions,
          signers: startAuctionSigners,
        },
      };

      let signers = [
        lookup.taxPayment.signers,
        lookup.externalPriceAccount.signers,
        lookup.createVault.signers,
        lookup.addTokens.signers,
        lookup.closeVault.signers,
        lookup.makeAuction.signers,
        lookup.initAuctionManager.signers,
        lookup.setVaultAndAuctionAuthority.signers,
        lookup.validateBoxes.signers,
        lookup.startAuction.signers,
      ];
      let toRemoveSigners: any = [];
      let instructions = [
        lookup.taxPayment.instructions,
        lookup.externalPriceAccount.instructions,
        lookup.createVault.instructions,
        lookup.addTokens.instructions,
        lookup.closeVault.instructions,
        lookup.makeAuction.instructions,
        lookup.initAuctionManager.instructions,
        lookup.setVaultAndAuctionAuthority.instructions,
        lookup.validateBoxes.instructions,
        lookup.startAuction.instructions,
      ].filter((instr, i) => {
        if (instr.length > 0) {
          return true;
        } else {
          toRemoveSigners[i] = true;
          return false;
        }
      });

      let filteredSigners = signers.filter((_, i) => !toRemoveSigners[i]);
      const allSuccessFull = await sendTransactionsSmart(
        connection,
        wallet,
        instructions,
        filteredSigners,
        "single"
      );

      if (allSuccessFull.isAllSuccess) {
        try {
          //waiting for auction to completely finalized
          const lastidx =
            allSuccessFull.txList[allSuccessFull.txList.length - 1];
          await metaplexConfirm(lastidx);

          const auctionDataTemp = await programs.auction.Auction.load(
            connection,
            new PublicKey(auction)
          );
          const onchainDate = new Date(
            auctionDataTemp.data?.endedAt?.toNumber() * 1000
          );

          auctionCreatedData.selectedDateTime = onchainDate.toISOString();
        } catch (err) {
          console.log("error getting on chain auction data");
        }
        const auctionData: any = await dispatch(
          createAuctionAction({
            auction: auction,
            auctionManager: auctionManager,
            nftId: auctionCreatedData?.nftData._id,
            mint: auctionCreatedData?.nftData.mint,
            tokenStore: tokenStoreAccount,
            status: "active",
            vaultId: vault,
            storeId: storeLoaded.pubkey.toBase58(),
            tokenTracker: tokenTracker,
            creatorNftRights: auctionCreatedData?.creatorNftRights,
            blockchainType: auctionCreatedData?.selectedBlockchain,
            auctionPrice: auctionCreatedData?.nftPrice,
            royaltyFee: auctionCreatedData?.royaltyFee,
            endDateTime: auctionCreatedData?.selectedDateTime,
            displayStreaming: auctionCreatedData?.displayStreaming,
            physicalReproduction: auctionCreatedData?.physicalReproduction,
            auctionType: auctionCreatedData?.auctionType,
            collectionId: auctionCreatedData?.nftData?.collectionId,
          })
        );

        const auctionParamsData = { auctionId: auctionData?._id };

        dispatch(setMessage("NFT Listed Successfully"));
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(true));

        const taxTransaction: any = await dispatch(
          userPaymentAction(
            auctionCreatedData?.nftDetails?._id,
            null,
            auctionCreatedData?.nftDetails?.userId?._id,
            systemSetting?.mintPiqsolFee,
            allSuccessFull.txList[0],
            "minting"
          )
        );

        navigate(`/explore/explore-details/${auctionCreatedData?.nftData._id}`);
      } else {
        dispatch(setMessage("There is something wrong please try again later"));
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
      }
    } catch (error) {
      console.log("create auction error  ====", error);
      dispatch(
        setMessage(
          "There is something wrong please try again later" +
            extractErrorMessage(error)
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
    } finally {
      setLoading(false);
    }
  };

  const makeFractions = async () => {
    console.log("auctionCreatedData ====", auctionCreatedData);

    if (!auctionCreatedData?.perBlockPrice) {
      dispatch(setMessage("Per block Price is required"));
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
      return;
    }

    if (auctionCreatedData?.blockSize === 0) {
      dispatch(
        setMessage("Please Select No. Of Blocks for you NFT to fractionalize")
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
      return;
    }

    let vaultPubKey = undefined;
    let fractionalMintPubKey = undefined;

    try {
      setLoading(true);
      let txHash = "";

      if (auctionCreatedData?.selectedBlockchain.toLowerCase() !== "solana") {
        const { nftData } = auctionCreatedData;
        const transactionDetail = await sendFranctionAuctionNftToContract(
          nftData?.contractAddress,
          nftData?.tokenId,
          auctionCreatedData?.perBlockPrice,
          auctionCreatedData?.blockSize
        );
        txHash = transactionDetail?.transactionHash;
      } else {
        const connection = new Connection(endpoint.url);
        const adminWallet = new PublicKey(
          process.env.REACT_APP_ADMIN_WALLET_ADDRESS || ""
        );
        const fractionVaultNftResponse = await createVaultAddNFT({
          connection,
          wallet,
          nft_key: auctionCreatedData?.nftData?.mint,
          new_auth: adminWallet,
          mintPiqsolFee: systemSetting?.mintPiqsolFee,
        });

        if (fractionVaultNftResponse === -1) {
          setLoading(false);
          dispatch(
            setMessage(
              "You must have sol and piqsol token in your wallet for this action"
            )
          );
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(false));
          return;
        }

        const { response, vault, fractionMint }: any = fractionVaultNftResponse;

        if (!response.isAllSuccess) {
          setLoading(false);
          dispatch(setMessage("Something went wrong"));
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(false));
          return;
        }
        vaultPubKey = vault?.toBase58();
        fractionalMintPubKey = fractionMint?.toBase58();
        txHash = response.txList[0];
      }

      const image = auctionCreatedData?.nftData?.image;
      const x = Math.sqrt(auctionCreatedData?.blockSize);

      const fractionAuctionData = {
        widthFractions: x,
        heightFractions: x,
        image,
        auctionData: {
          nftId: auctionCreatedData?.nftData?._id,
          mint: auctionCreatedData?.nftData?.mint,
          tokenId: auctionCreatedData?.nftData?.tokenId || null,
          status: "active",
          blockchainType: auctionCreatedData?.selectedBlockchain,
          royaltyFee:
            Number(auctionCreatedData?.nftData.seller_fee_basis_points) / 100,
          auctionType: "fractional",
          creatorNftRights: auctionCreatedData?.creatorNftRights,
          collectionId: auctionCreatedData?.nftData?.collectionId?._id,
          displayStreaming: auctionCreatedData?.displayStreaming,
          physicalReproduction: auctionCreatedData?.physicalReproduction,
          perBlockPrice: Number(auctionCreatedData?.perBlockPrice),
          vaultPubKey,
          fractionalMintPubKey,
        },
      };

      const authToken = localStorage.getItem("authToken") || "";

      const makeFractionResponse = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + "nft/makeFractions",
        headers: {
          "x-auth-token": authToken,
        },
        data: fractionAuctionData,
      });

      if (makeFractionResponse.status === 200) {
        dispatch(setMessage("Fractions Created Successfully"));
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(true));

        await dispatch(
          userPaymentAction(
            auctionCreatedData?.nftData?._id,
            null,
            currentUser?.id,
            systemSetting?.mintPiqsolFee,
            txHash,
            "minting"
          )
        );

        setTimeout(() => {
          setLoading(false);
          navigate("/explore");
        }, 2000);
      }
    } catch (error: any) {
      console.log("auctionCreatedData ==== error ====", error);
      setLoading(false);
      dispatch(setMessage(extractErrorMessage(error)));
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
    }
  };

  return (
    <Container>
      <ScrollToTop />

      <Box sx={{ padding: "25px 10px" }}>
        <Typography component="div" className={Classes.nftSummaryCardWrapper}>
          <Typography component="h3" className={Classes.title}>
            Summary of NFT
          </Typography>

          <Typography component="div" className={Classes.infoWrapper}>
            <Typography
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Typography component="div" className={Classes.userInfo}>
                <Typography component="h4" className={Classes.itemText}>
                  Item
                </Typography>
                <Typography className={Classes.metaInfoWrapper}>
                  <Typography component="div">
                    <img
                      loading="lazy"
                      src={auctionCreatedData?.nftData?.image}
                      className={Classes.mainPhoto}
                      alt="img"
                    />
                  </Typography>
                  <Typography component="div">
                    <Typography component="h4" className={Classes.titleName}>
                      {auctionCreatedData?.nftData?.name}
                    </Typography>
                    <Typography component="p" className={Classes.detailInfo}>
                      <span>
                        {auctionCreatedData?.nftData?.collectionId?.fullName}
                      </span>{" "}
                      {auctionCreatedData?.nftData?.collectionId
                        ?.isVerified && <CheckCircleIcon fontSize="small" />}
                    </Typography>
                  </Typography>
                </Typography>
              </Typography>

              <Typography component="div" className={Classes.priceSection}>
                <Typography component="h4" className={Classes.subtotal}>
                  Subtotal
                </Typography>
                <Typography component="h4" className={Classes.itemPrice}>
                  {`${getConvertedDecimalPrice(auctionCreatedData?.nftPrice)} ${
                    CHAIN_CURRENCY[
                      auctionCreatedData?.nftData?.blockchainType?.toLowerCase()
                    ]
                  }`}
                </Typography>
                <Typography component="h4" className={Classes.subtotal}>
                  {`$${auctionCreatedData?.nftPriceInUSD?.toFixed(4)}`}
                </Typography>
                <Typography component="h4" className={Classes.subtotal}>
                  Platform Fee: {systemSetting?.listingItemTax} PQL
                </Typography>
              </Typography>
            </Typography>
          </Typography>
          <Typography component="div" className={Classes.infoItem}>
            {(auctionCreatedData?.creatorNftRights
              ?.publicDisplayOrStreamArtWork ||
              auctionCreatedData?.creatorNftRights?.digitalReproduction ||
              auctionCreatedData?.creatorNftRights
                ?.physicalReproductionRights ||
              auctionCreatedData?.creatorNftRights
                ?.physicalReproductionRights) && (
              <>
                <Typography component="div" className={Classes.infoItem}>
                  <Typography component="h4" className={Classes.itemTitle}>
                    The Creator of this NFT confirms to have the following
                    rights:
                  </Typography>

                  {auctionCreatedData?.creatorNftRights
                    ?.publicDisplayOrStreamArtWork && (
                    <Typography
                      component="p"
                      className={Classes.itemDescription}
                    >
                      I confirm to own/have expressly obtained from the creator
                      of the artworks the copyrights necessary for the Public
                      display and/or streaming of the NFT associated artworks.
                    </Typography>
                  )}

                  {auctionCreatedData?.creatorNftRights
                    ?.digitalReproduction && (
                    <Typography
                      component="p"
                      className={Classes.itemDescription}
                    >
                      I confirm to be the artist/creator of the selected
                      artwork(s) and/or to own/have expressly obtained from the
                      creator the copyrights necessary for the digital
                      reproduction of the selected artworks and their display
                      within the PIQSOL ecosystem.
                    </Typography>
                  )}

                  {auctionCreatedData?.creatorNftRights
                    ?.physicalReproductionRights && (
                    <Typography
                      component="p"
                      className={Classes.itemDescription}
                    >
                      I confirm that I own the physical reproduction rights for
                      all of the selected artwork(s).
                    </Typography>
                  )}

                  {auctionCreatedData?.creatorNftRights
                    ?.digitalCommercialization && (
                    <Typography
                      component="p"
                      className={Classes.itemDescription}
                    >
                      I confirm to own the digital commercialization rights for
                      the selected artwork(s).
                    </Typography>
                  )}
                </Typography>

                <Divider
                  sx={{
                    marginBottom: "20px",
                    borderColor: "var(--border-color)",
                  }}
                />
              </>
            )}

            {(auctionCreatedData?.displayStreaming?.piqsolEcosystem ||
              auctionCreatedData?.displayStreaming?.privatePurposes ||
              auctionCreatedData?.displayStreaming?.commercialPurposes) && (
              <Typography component="h4" className={Classes.itemTitle}>
                Display / Streaming Rights Granted:
              </Typography>
            )}
            {auctionCreatedData?.displayStreaming?.noDisplayStreaming && (
              <Typography component="p" className={Classes.itemDescription}>
                No Display/streaming allowed.
              </Typography>
            )}

            {auctionCreatedData?.displayStreaming?.piqsolEcosystem && (
              <Typography component="p" className={Classes.itemDescription}>
                Stream the associated artwork(s) on the piqsol ecosystem.
              </Typography>
            )}

            {auctionCreatedData?.displayStreaming?.privatePurposes && (
              <Typography component="p" className={Classes.itemDescription}>
                Stream the associated artwork(s) anywhere for private purposes.
              </Typography>
            )}

            {auctionCreatedData?.displayStreaming?.commercialPurposes && (
              <Typography component="p" className={Classes.itemDescription}>
                Stream the associated artwork(s) anywhere for commercial
                purposes.
              </Typography>
            )}
          </Typography>
          <Divider
            sx={{ marginBottom: "20px", borderColor: "var(--border-color)" }}
          />

          {(auctionCreatedData?.physicalReproduction?.noReproduction ||
            auctionCreatedData?.physicalReproduction?.privatePurposes ||
            auctionCreatedData?.physicalReproduction?.oneCommercialPurposes ||
            auctionCreatedData?.physicalReproduction
              ?.multipleCommercialPurposes) && (
            <Typography component="div" className={Classes.infoItem}>
              <Typography component="h4" className={Classes.itemTitle}>
                Physical Reproduction Rights Granted:
              </Typography>

              {auctionCreatedData?.physicalReproduction?.noReproduction && (
                <Typography component="p" className={Classes.itemDescription}>
                  No physical reproductions.
                </Typography>
              )}

              {auctionCreatedData?.physicalReproduction?.privatePurposes && (
                <Typography component="p" className={Classes.itemDescription}>
                  Create physical reproductions for private purpose.
                </Typography>
              )}

              {auctionCreatedData?.physicalReproduction
                ?.oneCommercialPurposes && (
                <Typography component="p" className={Classes.itemDescription}>
                  Create one physical reproduction for commercial purposes.
                </Typography>
              )}

              {auctionCreatedData?.physicalReproduction
                ?.multipleCommercialPurposes && (
                <Typography component="p" className={Classes.itemDescription}>
                  Create multiple physical reproduction for commercial purposes.
                </Typography>
              )}
            </Typography>
          )}

          <Typography component="div" className={Classes.modalActionWrapper}>
            <Button
              onClick={() => {
                if (auctionCreatedData?.currentTab === "fractional") {
                  return makeFractions();
                }
                createAuction();
              }}
              variant="contained"
              className={Classes.mintNowBtn}
            >
              {loading ? "Listing in Progress" : "List To Marketplace"}
              {loading && (
                <CircularProgress
                  style={{ color: "white", marginLeft: 10 }}
                  size={16}
                />
              )}
            </Button>
            {loading && (
              <Typography
                sx={{ color: "var(--text-color)" }}
                component="p"
                className={`warning-msg ${Classes.itemDescription}`}
              >
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="color-red"
                />{" "}
                Listing in progress, don't close the window.
              </Typography>
            )}
          </Typography>
        </Typography>
      </Box>
    </Container>
  );
};

export default NFTSummary;
