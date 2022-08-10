import {
  CHAIN_NAME_BY_CHAIN_ID,
  CHAIN_TITLE,
  CHAIN_TITLE_BY_CHAIN_ID,
  getEstimatedGasPriceFromGasStationPolygon,
} from "components/common/helpers/helpers";
import { getUserBalance } from "utils/helpers/getUserBalance";
import {
  MARKETPLACE_CONTRACT_ADDRESS,
  MINTING_CONTRACTS_DETAILS,
  PQL_DEX_CONTRACT_ADDRESS,
  PQL_TOKEN_CONTRACT_ADDRESS,
  STACKING_CONTRACT_ADDRESS,
  COMMON_CONTRACT_ABI,
} from "./config";
import { checkForMetamaskNetwork, getWeb3 } from "./web3";

const initContract = (web3: any, contractABI: any, contractAddress: string) => {
  const contract = new web3.eth.Contract(contractABI, contractAddress);
  return contract;
};

const getGasPriceFromStation = async (web3: any, chainId: number) => {
  try {
    if (CHAIN_TITLE_BY_CHAIN_ID[chainId]?.toLowerCase() === "polygon") {
      const gasPriceByStation =
        await getEstimatedGasPriceFromGasStationPolygon();
      const gasPriceInGwei = await web3.utils.toWei(
        gasPriceByStation.toFixed(5),
        "gwei"
      );
      return gasPriceInGwei;
    }
    return false;
  } catch (err) {
    console.log(
      "🚀 ~ file: contractHelpers.ts ~ line 26 ~ getGasPriceFromStation ~ err",
      err
    );

    throw err;
  }
};

const checkForApprovalAndGetApproval = async (
  web3: any,
  chainId: number,
  accounts: any,
  spenderAddress: any,
  taxAmount: number
) => {
  try {
    if (taxAmount === 0) {
      return true;
    }

    const { userPiqsolBalance } = await getUserBalance(
      CHAIN_TITLE_BY_CHAIN_ID[chainId],
      {}
    );

    if (!userPiqsolBalance) {
      return -1;
    }

    let checkingForTokensApprovals = await checkForApprovalTokens(
      web3,
      chainId,
      accounts,
      spenderAddress
    );

    const approvedTokens = await web3.utils.fromWei(checkingForTokensApprovals);

    if (Number(approvedTokens) === taxAmount) return true;

    const approvalTaxPayment = await approveTokens(
      web3,
      chainId,
      accounts,
      spenderAddress,
      taxAmount
    );
    if (!approvalTaxPayment?.status && !approvalTaxPayment?.transactionHash) {
      return false;
    }

    return true;
  } catch (err) {
    console.log("🚀 ~ file: contractHelpers.ts ~ line 50 ~ err", err);
    throw err;
  }
};

const mintNewNFT = async (
  currentUser: any,
  tokenURI: string,
  taxAmount: number
) => {
  try {
    await checkForMetamaskNetwork(currentUser?.chainType);

    const web3 = await getWeb3();

    const chainId = await web3.eth.getChainId();

    const accounts = await web3.eth.getAccounts();

    const checkingForTokensApprovals = await checkForApprovalAndGetApproval(
      web3,
      chainId,
      accounts,
      MINTING_CONTRACTS_DETAILS[chainId].address,
      taxAmount
    );

    if (checkingForTokensApprovals === -1) return -2;

    if (checkingForTokensApprovals) {
      const contract = initContract(
        web3,
        MINTING_CONTRACTS_DETAILS[chainId]?.contractABI,
        MINTING_CONTRACTS_DETAILS[chainId]?.address
      );
      const estimatedGasFees = await contract.methods
        .safeMint(accounts[0], tokenURI)
        .estimateGas({ from: accounts[0] });

      const gasPriceFromStation = await getGasPriceFromStation(web3, chainId);

      if (gasPriceFromStation) {
        const mintNftResults = await contract.methods
          .safeMint(accounts[0], tokenURI)
          .send({
            from: accounts[0],
            gas: estimatedGasFees,
            gasPrice: gasPriceFromStation,
          });
        return {
          mintNftResults,
          contractAddress: MINTING_CONTRACTS_DETAILS[chainId]?.address,
        };
      }

      const mintNftResults = await contract.methods
        .safeMint(accounts[0], tokenURI)
        .send({
          from: accounts[0],
          gas: estimatedGasFees,
        });
      return {
        mintNftResults,
        contractAddress: MINTING_CONTRACTS_DETAILS[chainId]?.address,
      };
    }
    return false;
  } catch (err) {
    console.log(
      "🚀 ~ file: contractHelpers.ts ~ line 14 ~ mintNewNFT ~ err",
      err
    );
    throw err;
  }
};

const mintFNFT = async (
  currentUser: any,
  tokenURI: string,
  ownerAddress: string,
  buyAmount: number,
  taxAmount: number,
  parentId: number,
  parentTokenAddress: string
) => {
  try {
    await checkForMetamaskNetwork(currentUser?.chainType);

    const web3 = await getWeb3();

    const chainId = await web3.eth.getChainId();

    const accounts = await web3.eth.getAccounts();

    const checkingForTokensApprovals = await checkForApprovalAndGetApproval(
      web3,
      chainId,
      accounts,
      MINTING_CONTRACTS_DETAILS[chainId].address,
      taxAmount
    );
    if (checkingForTokensApprovals === -1) return -2;

    if (checkingForTokensApprovals) {
      const contract = initContract(
        web3,
        MINTING_CONTRACTS_DETAILS[chainId]?.contractABI,
        MINTING_CONTRACTS_DETAILS[chainId]?.address
      );

      const buyAmountWey = web3.utils.toWei(buyAmount.toString());
      const estimatedGasFees = await contract.methods
        .buy_fnft(ownerAddress, tokenURI, parentId, parentTokenAddress)
        .estimateGas({ from: accounts[0], value: buyAmountWey });

      const gasPriceFromStation = await getGasPriceFromStation(web3, chainId);

      if (gasPriceFromStation) {
        const mintNftResults = await contract.methods
          .buy_fnft(ownerAddress, tokenURI, parentId, parentTokenAddress)
          .send({
            from: accounts[0],
            gas: estimatedGasFees,
            value: buyAmountWey,
            gasPrice: gasPriceFromStation,
          });
        return {
          contractAddress: MINTING_CONTRACTS_DETAILS[chainId].address,
          mintNftResults,
        };
      }

      const mintNftResults = await contract.methods
        .buy_fnft(ownerAddress, tokenURI, parentId, parentTokenAddress)
        .send({
          from: accounts[0],
          gas: estimatedGasFees,
          value: buyAmountWey,
        });
      return {
        contractAddress: MINTING_CONTRACTS_DETAILS[chainId].address,
        mintNftResults,
      };
    }
    return false;
  } catch (err) {
    console.log(
      "🚀 ~ file: contractHelpers.ts ~ line 14 ~ mintNewNFT ~ err",
      err
    );
    throw err;
  }
};

const isApprovedForAll = async (
  web3: any,
  contract: any,
  CONTRACT_ADDRESS: string
) => {
  const accounts = await web3.eth.getAccounts();

  const isApproved = await contract.methods
    .isApprovedForAll(accounts[0], CONTRACT_ADDRESS)
    .call({ from: accounts[0] });

  return isApproved;
};

const checkForIsApproved = async (
  web3: any,
  contract: any,
  tokenId: string
) => {
  const accounts = await web3.eth.getAccounts();
  const isApproved = await contract.methods
    .getApproved(parseInt(tokenId))
    .call({
      from: accounts[0],
    });
  return isApproved;
};

const approve = async (
  web3: any,
  contract: any,
  tokenId: string,
  MARKETPLACE_CONTRACT_ADDRESS: string
) => {
  const accounts = await web3.eth.getAccounts();
  const chainId = await web3.eth.getChainId();
  const estimatedGasFees = await contract.methods
    .approve(MARKETPLACE_CONTRACT_ADDRESS, parseInt(tokenId))
    .estimateGas({ from: accounts[0] });

  const gasPriceFromStation = await getGasPriceFromStation(web3, chainId);

  if (gasPriceFromStation) {
    const gettingApproval = await contract.methods
      .approve(MARKETPLACE_CONTRACT_ADDRESS, parseInt(tokenId))
      .send({
        from: accounts[0],
        gas: estimatedGasFees,
        gasPrice: gasPriceFromStation,
      });
    return gettingApproval;
  }

  const gettingApproval = await contract.methods
    .approve(MARKETPLACE_CONTRACT_ADDRESS, parseInt(tokenId))
    .send({ from: accounts[0], gas: estimatedGasFees });
  return gettingApproval;
};

const setApprovalForAll = async (
  web3: any,
  contract: any,
  CONTRACT_ADDRESS: string
) => {
  try {
    const accounts = await web3.eth.getAccounts();
    const chainId = await web3.eth.getChainId();
    const estimatedGasFees = await contract.methods
      .setApprovalForAll(CONTRACT_ADDRESS, true)
      .estimateGas({ from: accounts[0] });

    const gasPriceFromStation = await getGasPriceFromStation(web3, chainId);

    if (gasPriceFromStation) {
      const settingApprovalForAll = await contract.methods
        .setApprovalForAll(CONTRACT_ADDRESS, true)
        .send({
          from: accounts[0],
          gas: estimatedGasFees,
          gasPrice: gasPriceFromStation,
        });
      return settingApprovalForAll;
    }

    const settingApprovalForAll = await contract.methods
      .setApprovalForAll(CONTRACT_ADDRESS, true)
      .send({
        from: accounts[0],
        gas: estimatedGasFees,
      });
    return settingApprovalForAll;
  } catch (err) {
    console.log(
      "🚀 ~ file: contractHelpers.ts ~ line 43 ~ setApprovalForAll ~ err",
      err
    );

    throw err;
  }
};

const listItemForFixedPrice = async (
  web3: any,
  contract: any,
  approvalContract: any,
  contractFunctionArguments: any,
  MARKETPLACE_CONTRACT_ADDRESS: string,
  NFT_CONTRACT_ADDRESS: string,
  taxAmount: number
) => {
  try {
    const accounts = await web3.eth.getAccounts();

    const chainId = await web3.eth.getChainId();

    const checkingForTokensApprovals = await checkForApprovalAndGetApproval(
      web3,
      chainId,
      accounts,
      MARKETPLACE_CONTRACT_ADDRESS,
      taxAmount
    );

    if (checkingForTokensApprovals === -1) return -2;

    if (checkingForTokensApprovals) {
      const priceToWei = await web3.utils.toWei(
        contractFunctionArguments?.price.toString()
      );
      let isApproved = await checkForIsApproved(
        web3,
        approvalContract,
        contractFunctionArguments?.tokenId
      );

      if (
        isApproved?.toLowerCase() !== MARKETPLACE_CONTRACT_ADDRESS.toLowerCase()
      ) {
        const settingApprovalForAll = await approve(
          web3,
          approvalContract,
          contractFunctionArguments?.tokenId,
          MARKETPLACE_CONTRACT_ADDRESS
        );

        if (!settingApprovalForAll?.status) {
          return -1;
        }

        if (
          settingApprovalForAll?.status &&
          settingApprovalForAll?.transactionHash
        ) {
          isApproved = true;
        }
      }

      if (
        isApproved === true ||
        isApproved?.toLowerCase() === MARKETPLACE_CONTRACT_ADDRESS.toLowerCase()
      ) {
        const estimatedGasFees = await contract.methods
          .listFixedItemToMarket(
            parseInt(contractFunctionArguments?.tokenId),
            NFT_CONTRACT_ADDRESS,
            BigInt(priceToWei),
            contractFunctionArguments?.royaltiesAddress,
            contractFunctionArguments?.percentageBasisPoints
          )
          .estimateGas({ from: accounts[0] });

        const gasPriceFromStation = await getGasPriceFromStation(web3, chainId);

        if (gasPriceFromStation) {
          const listingItemOnSaleForFixedPrice = await contract.methods
            .listFixedItemToMarket(
              parseInt(contractFunctionArguments?.tokenId),
              NFT_CONTRACT_ADDRESS,
              BigInt(priceToWei),
              contractFunctionArguments?.royaltiesAddress,
              contractFunctionArguments?.percentageBasisPoints
            )
            .send({
              from: accounts[0],
              gas: estimatedGasFees,
              gasPrice: gasPriceFromStation,
            });

          return listingItemOnSaleForFixedPrice;
        }

        const listingItemOnSaleForFixedPrice = await contract.methods
          .listFixedItemToMarket(
            parseInt(contractFunctionArguments?.tokenId),
            NFT_CONTRACT_ADDRESS,
            BigInt(priceToWei),
            contractFunctionArguments?.royaltiesAddress,
            contractFunctionArguments?.percentageBasisPoints
          )
          .send({
            from: accounts[0],
            gas: estimatedGasFees,
          });

        return listingItemOnSaleForFixedPrice;
      }
    }

    return false;
  } catch (err) {
    console.log("🚀 ~ file: contractHelpers.ts ~ line 77 ~ err", err);
    throw err;
  }
};

const listItemForAuction = async (
  web3: any,
  contract: any,
  approvalContract: any,
  MARKETPLACE_CONTRACT_ADDRESS: string,
  NFT_CONTRACT_ADDRESS: string,
  contractFunctionArguments: any,
  taxAmount: number
) => {
  try {
    const accounts = await web3.eth.getAccounts();

    const chainId = await web3.eth.getChainId();

    const checkingForTokensApprovals = await checkForApprovalAndGetApproval(
      web3,
      chainId,
      accounts,
      MARKETPLACE_CONTRACT_ADDRESS,
      taxAmount
    );
    if (checkingForTokensApprovals === -1) return -2;

    if (checkingForTokensApprovals) {
      const priceToWei = await web3.utils.toWei(
        contractFunctionArguments?.price.toString()
      );

      let isApproved = await checkForIsApproved(
        web3,
        approvalContract,
        contractFunctionArguments?.tokenId
      );

      if (
        isApproved?.toLowerCase() !== MARKETPLACE_CONTRACT_ADDRESS.toLowerCase()
      ) {
        const settingApprovalForAll = await approve(
          web3,
          approvalContract,
          contractFunctionArguments?.tokenId,
          MARKETPLACE_CONTRACT_ADDRESS
        );

        if (!settingApprovalForAll?.status) {
          return -1;
        }

        if (
          settingApprovalForAll?.status &&
          settingApprovalForAll?.transactionHash
        ) {
          isApproved = true;
        }
      }

      if (
        isApproved === true ||
        isApproved?.toLowerCase() === MARKETPLACE_CONTRACT_ADDRESS.toLowerCase()
      ) {
        const estimatedGas = await contract.methods
          .listAuctionItemToMarket(
            contractFunctionArguments?.tokenId,
            NFT_CONTRACT_ADDRESS,
            BigInt(priceToWei),
            contractFunctionArguments?.endTime,
            contractFunctionArguments?.royaltiesAddress,
            contractFunctionArguments?.percentageBasisPoints
          )
          .estimateGas({ from: accounts[0] });

        const gasPriceFromStation = await getGasPriceFromStation(web3, chainId);

        if (gasPriceFromStation) {
          const startingAuction = await contract.methods
            .listAuctionItemToMarket(
              contractFunctionArguments?.tokenId,
              NFT_CONTRACT_ADDRESS,
              BigInt(priceToWei),
              contractFunctionArguments?.endTime,
              contractFunctionArguments?.royaltiesAddress,
              contractFunctionArguments?.percentageBasisPoints
            )
            .send({
              from: accounts[0],
              gas: estimatedGas,
              gasPrice: gasPriceFromStation,
            });
          return startingAuction;
        }

        const startingAuction = await contract.methods
          .listAuctionItemToMarket(
            contractFunctionArguments?.tokenId,
            NFT_CONTRACT_ADDRESS,
            BigInt(priceToWei),
            contractFunctionArguments?.endTime,
            contractFunctionArguments?.royaltiesAddress,
            contractFunctionArguments?.percentageBasisPoints
          )
          .send({ from: accounts[0], gas: estimatedGas });
        return startingAuction;
      }
    }
    return false;
  } catch (err) {
    console.log("🚀 ~ file: contractHelpers.ts ~ line 134 ~ err", err);
    throw err;
  }
};

const placeNftBid = async (
  web3: any,
  contract: any,
  marketplaceItemListId: string,
  value: Number,
  taxAmount: number
) => {
  try {
    const valueToWei = await web3.utils.toWei(value);
    const accounts = await web3.eth.getAccounts();

    const chainId = await web3.eth.getChainId();

    const checkingForTokensApprovals = await checkForApprovalAndGetApproval(
      web3,
      chainId,
      accounts,
      MARKETPLACE_CONTRACT_ADDRESS[chainId].address,
      taxAmount
    );

    if (checkingForTokensApprovals === -1) return -2;

    if (checkingForTokensApprovals) {
      const estimatedGasFees = await contract.methods
        .bid(parseInt(marketplaceItemListId))
        .estimateGas({ from: accounts[0], value: valueToWei });

      const gasPriceFromStation = await getGasPriceFromStation(web3, chainId);

      if (gasPriceFromStation) {
        const bidNftResults = await contract.methods
          .bid(parseInt(marketplaceItemListId))
          .send({
            from: accounts[0],
            gas: estimatedGasFees,
            value: valueToWei,
            gasPrice: gasPriceFromStation,
          });
        return bidNftResults;
      }

      const bidNftResults = await contract.methods
        .bid(parseInt(marketplaceItemListId))
        .send({
          from: accounts[0],
          gas: estimatedGasFees,
          value: valueToWei,
        });
      return bidNftResults;
    }
    return false;
  } catch (err) {
    console.log(
      "🚀 ~ file: contractHelpers.ts ~ line 199 ~ placeNftBid ~ err",
      err
    );
    throw err;
  }
};

const endAuction = async (web3: any, contract: any, tokenId: string) => {
  try {
    const accounts = await web3.eth.getAccounts();

    const chainId = await web3.eth.getChainId();

    const estimatedGasFees = await contract.methods
      .auctionEnd(parseInt(tokenId))
      .estimateGas({ from: accounts[0] });

    const gasPriceFromStation = await getGasPriceFromStation(web3, chainId);

    if (gasPriceFromStation) {
      const endAuctionResult = await contract.methods
        .auctionEnd(parseInt(tokenId))
        .send({
          from: accounts[0],
          gas: estimatedGasFees,
          gasPrice: gasPriceFromStation,
        });

      return endAuctionResult;
    }

    const endAuctionResult = await contract.methods
      .auctionEnd(parseInt(tokenId))
      .send({
        from: accounts[0],
        gas: estimatedGasFees,
      });

    return endAuctionResult;
  } catch (err) {
    throw err;
  }
};

const buyNowFixedPriceNft = async (
  web3: any,
  contract: any,
  merketplaceListItemId: string,
  auctionPrice: number,
  taxAmount: number
) => {
  try {
    const [accounts, priceToWei, chainId] = await Promise.all([
      web3.eth.getAccounts(),
      web3.utils.toWei(auctionPrice.toString()),
      await web3.eth.getChainId(),
    ]);

    const checkingForTokensApprovals = await checkForApprovalAndGetApproval(
      web3,
      chainId,
      accounts,
      MARKETPLACE_CONTRACT_ADDRESS[chainId].address,
      taxAmount
    );
    if (checkingForTokensApprovals === -1) return -2;

    if (checkingForTokensApprovals) {
      // TODO: Adding Approvals for tokens

      const estimatedGasFees = await contract.methods
        .buyItem(merketplaceListItemId)
        .estimateGas({ from: accounts[0], value: priceToWei });

      const gasPriceFromStation = await getGasPriceFromStation(web3, chainId);

      if (gasPriceFromStation) {
        const buyNowFixedPriceResponse = await contract.methods
          .buyItem(merketplaceListItemId)
          .send({
            from: accounts[0],
            value: priceToWei,
            gas: estimatedGasFees,
            gasPrice: gasPriceFromStation,
          });
        return buyNowFixedPriceResponse;
      }

      const buyNowFixedPriceResponse = await contract.methods
        .buyItem(merketplaceListItemId)
        .send({
          from: accounts[0],
          value: priceToWei,
          gas: estimatedGasFees,
        });
      return buyNowFixedPriceResponse;
    }
    return false;
  } catch (err) {
    console.log(
      "🚀 ~ file: contractHelpers.ts ~ line 239 ~ buyNowFixedPriceNft ~ err",
      err
    );
    throw err;
  }
};

const confirmSaleAndTransferOwnerShip = async (
  web3: any,
  contract: any,
  tokenId: string
) => {
  try {
    const accounts = await web3.eth.getAccounts();
    const chainId = await web3.eth.getChainId();
    const estimatedGasFees = await contract.methods
      .confirmRequest(parseInt(tokenId))
      .estimateGas({ from: accounts[0] });

    const gasPriceFromStation = await getGasPriceFromStation(web3, chainId);

    if (gasPriceFromStation) {
      const confirmRequestResponse = await contract.methods
        .confirmRequest(parseInt(tokenId))
        .send({
          from: accounts[0],
          gas: estimatedGasFees,
          gasPrice: gasPriceFromStation,
        });
      return confirmRequestResponse;
    }

    const confirmRequestResponse = await contract.methods
      .confirmRequest(parseInt(tokenId))
      .send({ from: accounts[0], gas: estimatedGasFees });
    return confirmRequestResponse;
  } catch (err) {
    console.log(
      "🚀 ~ file: contractHelpers.ts ~ line 258 ~ confirmSaleAndTransferOwnerShip ~ err",
      err
    );
    throw err;
  }
};

const sendFranctionAuctionNftToContract = async (
  tokenAddress: string,
  tokenId: string,
  fnftPrice: number,
  totalBlocks: number
) => {
  try {
    const web3 = await getWeb3();

    const chainId = await web3.eth.getChainId();

    const contractDetails = MINTING_CONTRACTS_DETAILS[chainId];

    if (contractDetails?.address !== tokenAddress) {
      const commonContract = await initContract(
        web3,
        COMMON_CONTRACT_ABI.contractABI,
        tokenAddress
      );

      let isApproved = await checkForIsApproved(web3, commonContract, tokenId);

      if (
        isApproved?.toLowerCase() !== contractDetails?.address.toLowerCase()
      ) {
        const approvalOfTokenResponse = await approve(
          web3,
          commonContract,
          tokenId,
          contractDetails?.address
        );
        if (
          approvalOfTokenResponse?.status &&
          approvalOfTokenResponse?.transactionHash
        ) {
          isApproved = true;
        }

        if (!isApproved) {
          throw new Error("Unable get the approval of token");
        }
      }
    }

    const contract = initContract(
      web3,
      contractDetails.contractABI,
      contractDetails.address
    );

    const accounts = await web3.eth.getAccounts();

    const valueToWei = await web3.utils.toWei(fnftPrice?.toString());

    let approvedForAll = await isApprovedForAll(
      web3,
      contract,
      contractDetails?.address
    );

    if (!approvedForAll) {
      const getApproval = await setApprovalForAll(
        web3,
        contract,
        contractDetails?.address
      );

      if (!getApproval?.status) {
        approvedForAll = false;
      }
    }

    if (approvedForAll) {
      const estimatedGasFees = await contract.methods
        .transfer_fnft_ownership(
          tokenAddress,
          parseInt(tokenId),
          valueToWei,
          totalBlocks
        )
        .estimateGas({ from: accounts[0] });

      const gasPriceFromStation = await getGasPriceFromStation(web3, chainId);

      if (gasPriceFromStation) {
        const transferFnftOwnerShip = await contract.methods
          .transfer_fnft_ownership(
            tokenAddress,
            parseInt(tokenId),
            valueToWei,
            totalBlocks
          )
          .send({
            from: accounts[0],
            gas: estimatedGasFees,
            gasPrice: gasPriceFromStation,
          });

        return transferFnftOwnerShip;
      }

      const transferFnftOwnerShip = await contract.methods
        .transfer_fnft_ownership(
          tokenAddress,
          parseInt(tokenId),
          valueToWei,
          totalBlocks
        )
        .send({
          from: accounts[0],
          gas: estimatedGasFees,
        });

      return transferFnftOwnerShip;
    }
    return false;
  } catch (err) {
    throw err;
  }
};

const buyPQLTokens = async (ethAmount: number) => {
  try {
    const web3 = await getWeb3();
    const chainId = await web3.eth.getChainId();
    const accounts = await web3.eth.getAccounts();

    const ethAmountToWei = await web3.utils.toWei(ethAmount?.toString());

    const pqlContractDetails = PQL_TOKEN_CONTRACT_ADDRESS[chainId];
    const dexContractDetails = PQL_DEX_CONTRACT_ADDRESS[chainId];

    const contract = initContract(
      web3,
      dexContractDetails.contractABI,
      dexContractDetails?.address
    );

    const estimatedGasFees = await contract.methods
      .Buy()
      .estimateGas({ from: accounts[0], value: ethAmountToWei });

    const gasPriceFromStation = await getGasPriceFromStation(web3, chainId);

    if (gasPriceFromStation) {
      const buyPQLTokensResponse = await contract.methods.Buy().send({
        from: accounts[0],
        gas: estimatedGasFees,
        value: ethAmountToWei,
        gasPrice: gasPriceFromStation,
      });

      return buyPQLTokensResponse;
    }

    const buyPQLTokensResponse = await contract.methods.Buy().send({
      from: accounts[0],
      gas: estimatedGasFees,
      value: ethAmountToWei,
    });

    return buyPQLTokensResponse;
  } catch (err) {
    console.log(
      "🚀 ~ file: contractHelpers.ts ~ line 527 ~ buyPQLTokens ~ err",
      err
    );
    throw err;
  }
};

const getPQLBalance = async (web3: any, accounts: any) => {
  try {
    const chainId = await web3.eth.getChainId();

    const pqlContractDetails = PQL_TOKEN_CONTRACT_ADDRESS[chainId];

    const contract = initContract(
      web3,
      pqlContractDetails?.contractABI,
      pqlContractDetails?.address
    );

    const balance = await contract.methods
      .balanceOf(accounts[0])
      .call({ from: accounts[0] });

    const convertedValue = await web3.utils.fromWei(balance, "ether");

    return convertedValue;
  } catch (err) {
    console.log(
      "🚀 ~ file: contractHelpers.ts ~ line 526 ~ getPQLBalance ~ err",
      err
    );
    throw err;
  }
};

const approveTokens = async (
  web3: any,
  chainId: number,
  accounts: any,
  spenderAddress: string,
  amount: number
) => {
  try {
    const tokenContractDetails = PQL_TOKEN_CONTRACT_ADDRESS[chainId];
    const valueToWei = await web3.utils.toWei(amount?.toString());
    const contract = initContract(
      web3,
      tokenContractDetails?.contractABI,
      tokenContractDetails?.address
    );

    const estimatedGasFees = await contract.methods
      .approve(spenderAddress, valueToWei)
      .estimateGas({ from: accounts[0] });

    const gasPriceFromStation = await getGasPriceFromStation(web3, chainId);

    if (gasPriceFromStation) {
      const approvedTokens = await contract.methods
        .approve(spenderAddress, valueToWei)
        .send({
          from: accounts[0],
          gas: estimatedGasFees,
          gasPrice: gasPriceFromStation,
        });
      return approvedTokens;
    }

    const approvedTokens = await contract.methods
      .approve(spenderAddress, valueToWei)
      .send({ from: accounts[0], gas: estimatedGasFees });

    return approvedTokens;
  } catch (err) {
    console.log(
      "🚀 ~ file: contractHelpers.ts ~ line 554 ~ approveTokens ~ err",
      err
    );
    throw err;
  }
};

const checkForApprovalTokens = async (
  web3: any,
  chainId: number,
  accounts: any,
  spenderAddress: string
) => {
  try {
    const tokenContractDetails = PQL_TOKEN_CONTRACT_ADDRESS[chainId];
    const contract = initContract(
      web3,
      tokenContractDetails?.contractABI,
      tokenContractDetails?.address
    );

    const approvedTokens = await contract.methods
      .allowance(accounts[0], spenderAddress)
      .call({ from: accounts[0] });

    return approvedTokens;
  } catch (err) {
    console.log(
      "🚀 ~ file: contractHelpers.ts ~ line 554 ~ approveTokens ~ err",
      err
    );
    throw err;
  }
};

const stakeUserTokens = async (amount: number, plan: number) => {
  try {
    const web3 = await getWeb3();
    const chainId = await web3.eth.getChainId();

    const accounts = await web3.eth.getAccounts();

    const stakingContractDetails = STACKING_CONTRACT_ADDRESS[chainId];

    const checkingForTokensApprovals = await checkForApprovalAndGetApproval(
      web3,
      chainId,
      accounts,
      stakingContractDetails.address,
      amount
    );

    if (checkingForTokensApprovals === -1) return -2;

    if (checkingForTokensApprovals) {
      const stakingContract = initContract(
        web3,
        stakingContractDetails.contractABI,
        stakingContractDetails.address
      );

      const valueToWei = await web3.utils.toWei(amount?.toString());

      const estimatedGasFees = await stakingContract.methods
        .staking(valueToWei, plan)
        .estimateGas({ from: accounts[0] });

      const gasPriceFromStation = await getGasPriceFromStation(web3, chainId);

      if (gasPriceFromStation) {
        const stackedTokens = await stakingContract.methods
          .staking(valueToWei, plan)
          .send({
            from: accounts[0],
            gas: estimatedGasFees,
            gasPrice: gasPriceFromStation,
          });
        return stackedTokens;
      }

      const stackedTokens = await stakingContract.methods
        .staking(valueToWei, plan)
        .send({ from: accounts[0], gas: estimatedGasFees });

      return stackedTokens;
    }

    return false;
  } catch (err) {
    console.log(
      "🚀 ~ file: contractHelpers.ts ~ line 553 ~ stakeUserTokens ~ err",
      err
    );
  }
};

const payingTaxForChatForMultichain = async (taxCharges: number) => {
  try {
    const web3 = await getWeb3();
    const chainId = await web3.eth.getChainId();
    const accounts = await web3.eth.getAccounts();
    const tokenContractDetails = PQL_TOKEN_CONTRACT_ADDRESS[chainId];
    const valueToWei = await web3.utils.toWei(taxCharges?.toString());
    const contract = initContract(
      web3,
      tokenContractDetails?.contractABI,
      tokenContractDetails?.address
    );

    const adminWallet = process.env.REACT_APP_METAMASK_ADMIN_WALLET_ADDRESS;
    const estimatedGasFees = await contract.methods
      .transfer(adminWallet, valueToWei)
      .estimateGas({ from: accounts[0] });

    const gasPriceFromStation = await getGasPriceFromStation(web3, chainId);

    if (gasPriceFromStation) {
      const responseForChatTaxFee = await contract.methods
        .transfer(adminWallet, valueToWei)
        .send({
          from: accounts[0],
          gas: estimatedGasFees,
          gasPrice: gasPriceFromStation,
        });
      return responseForChatTaxFee;
    }

    const responseForChatTaxFee = await contract.methods
      .transfer(adminWallet, valueToWei)
      .send({ from: accounts[0], gas: estimatedGasFees });
    return responseForChatTaxFee;
  } catch (err) {
    console.log(
      "🚀 ~ file: contractHelpers.ts ~ line 1048 ~ payingTaxForChatForMultichain ~ err",
      err
    );
    throw err;
  }
};

const cancelListingsOfFixedPrice = async (
  marketplaceItemId: number,
  functionNameForAuctionType: string
) => {
  try {
    const web3 = await getWeb3();
    const [chainId, accounts] = await Promise.all([
      web3.eth.getChainId(),
      web3.eth.getAccounts(),
    ]);

    const contractDetails = MARKETPLACE_CONTRACT_ADDRESS[chainId];

    const contract = initContract(
      web3,
      contractDetails?.contractABI,
      contractDetails?.address
    );

    const estimatedGasFees = await contract.methods[functionNameForAuctionType](
      marketplaceItemId
    ).estimateGas({ from: accounts[0] });

    const gasPriceFromStation = await getGasPriceFromStation(web3, chainId);

    if (gasPriceFromStation) {
      const cancelListingsResponse = await contract.methods[
        functionNameForAuctionType
      ](marketplaceItemId).send({
        from: accounts[0],
        gas: estimatedGasFees,
        gasPrice: gasPriceFromStation,
      });

      return cancelListingsResponse;
    }

    const cancelListingsResponse = await contract.methods[
      functionNameForAuctionType
    ](marketplaceItemId).send({ from: accounts[0], gas: estimatedGasFees });

    return cancelListingsResponse;
  } catch (err) {
    console.log(
      "🚀 ~ file: contractHelpers.ts ~ line 1092 ~ cancelListings ~ err",
      err
    );
    throw err;
  }
};

const cancelListingFnFT = async (tokenAddress: string, tokenId: number) => {
  try {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    const chainId = await web3.eth.getChainId();

    const contractDetails = MINTING_CONTRACTS_DETAILS[chainId];

    const contract = await initContract(
      web3,
      contractDetails?.contractABI,
      contractDetails?.address
    );

    const estimatedGasFees = await contract.methods
      .cancle_fnft_ownership(tokenAddress, tokenId)
      .estimateGas({ from: accounts[0] });
    const gasPriceFromStation = await getGasPriceFromStation(web3, chainId);

    if (gasPriceFromStation) {
      const responseOfCancelOwnerShip = await contract.methods
        .cancle_fnft_ownership(tokenAddress, tokenId)
        .send({
          from: accounts[0],
          gas: estimatedGasFees,
          gasPrice: gasPriceFromStation,
        });
      return responseOfCancelOwnerShip;
    }

    const responseOfCancelOwnerShip = await contract.methods
      .cancle_fnft_ownership(tokenAddress, tokenId)
      .send({
        from: accounts[0],
        gas: estimatedGasFees,
      });
    return responseOfCancelOwnerShip;
  } catch (err) {
    console.log(
      "🚀 ~ file: contractHelpers.ts ~ line 1143 ~ cancelListingFnFT ~ err",
      err
    );
    throw err;
    // return false;
  }
};

const withdrawUserStakedTokens = async (count: number) => {
  try {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    const chainId = await web3.eth.getChainId();
    const contractDetails = STACKING_CONTRACT_ADDRESS[chainId];

    const contract = initContract(
      web3,
      contractDetails?.contractABI,
      contractDetails?.address
    );

    const estimatedGas = await contract.methods
      .withdraw(count)
      .estimateGas({ from: accounts[0] });

    const gasPriceFromStation = await getGasPriceFromStation(web3, chainId);

    if (gasPriceFromStation) {
      const responseOfWithdrawStaking = await contract.methods
        .withdraw(count)
        .send({
          from: accounts[0],
          gas: estimatedGas,
          gasPrice: gasPriceFromStation,
        });
      return responseOfWithdrawStaking;
    }

    const responseOfWithdrawStaking = await contract.methods
      .withdraw(count)
      .send({ from: accounts[0], gas: estimatedGas });
    return responseOfWithdrawStaking;
  } catch (err) {
    console.log(
      "🚀 ~ file: contractHelpers.ts ~ line 1250 ~ withdrawUserStakedTokens ~ err",
      err
    );
    throw err;
  }
};

const sendEtherAmountToAdminWallet = async (convertedValue: number) => {
  try {
    const web3 = await getWeb3();
    const [chainId, accounts, valueToWei] = await Promise.all([
      web3.eth.getChainId(),
      web3.eth.getAccounts(),
      web3.utils.toWei(convertedValue?.toString()),
    ]);

    const gasAmount = await web3.eth.estimateGas({
      to: process.env.REACT_APP_METAMASK_ADMIN_WALLET_ADDRESS,
      from: accounts[0],
      value: valueToWei,
    });
    const gasPriceFromStation = await getGasPriceFromStation(web3, chainId);

    if (gasPriceFromStation !== false) {
      const sentTransaction = await web3.eth.sendTransaction({
        from: accounts[0],
        to: process.env.REACT_APP_METAMASK_ADMIN_WALLET_ADDRESS,
        value: valueToWei,
        gas: gasAmount,
        gasPrice: gasPriceFromStation,
      });

      return sentTransaction;
    }

    const sentTransaction = await web3.eth.sendTransaction({
      from: accounts[0],
      to: process.env.REACT_APP_METAMASK_ADMIN_WALLET_ADDRESS,
      value: valueToWei,
      gas: gasAmount,
    });

    return sentTransaction;
  } catch (err) {
    console.log(
      "🚀 ~ file: contractHelpers.ts ~ line 1294 ~ sendEtherAmountToAdminWal ~ err",
      err
    );
    throw err;
  }
};

export {
  initContract,
  mintNewNFT,
  isApprovedForAll,
  listItemForFixedPrice,
  listItemForAuction,
  placeNftBid,
  endAuction,
  buyNowFixedPriceNft,
  confirmSaleAndTransferOwnerShip,
  sendFranctionAuctionNftToContract,
  mintFNFT,
  buyPQLTokens,
  getPQLBalance,
  stakeUserTokens,
  payingTaxForChatForMultichain,
  cancelListingsOfFixedPrice,
  cancelListingFnFT,
  withdrawUserStakedTokens,
  sendEtherAmountToAdminWallet,
};
