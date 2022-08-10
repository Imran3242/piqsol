import { solToUSD } from "./solToDollarsPrice";

const getCurrentPrice = (auctionData, nftData, auctionBids) => {
  if (auctionData && auctionData?.status === "active") {
    if (auctionData?.auctionType === "fixedPrice") {
      return auctionData?.auctionPrice;
    }

    if (auctionData?.auctionType === "highestBid") {
      if (auctionBids?.length > 0)
        return auctionBids[0]?.price || auctionData?.auctionPrice;
      return auctionData?.auctionPrice;
    }

    if (auctionData?.auctionType === "fractional") {
      return auctionData?.perBlockPrice;
    }
  }

  return nftData?.currentPrice;
};
const getCurrentPriceInUSD = async (currentSolPrice,auctionData) => {
  return await solToUSD(currentSolPrice,auctionData?.blockchainType?.toLowerCase());
};

const getCurrentPriceInUSDforMessenger = async (priceToConvert,currentUser) => {
  return await solToUSD(priceToConvert,currentUser?.chainType?.toLowerCase());
};

export {
  getCurrentPrice,
  getCurrentPriceInUSD,
  getCurrentPriceInUSDforMessenger,
};
