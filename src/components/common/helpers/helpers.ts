import { walletAddressString } from "utils/helpers/walletAddressString";
import axios from "axios";

import BinanceLogo from "../../../assets/images/binance-logo.png";
import PolygonLogo from "../../../assets/images/polygon-logo.png";
import CardBadge from "../../../assets/images/card-badge.png";
import moment from "moment";

const CHAIN_LOGOS = {
  polygon: PolygonLogo,
  binance: BinanceLogo,
  Solana: CardBadge,
  solana: CardBadge,
  solona: CardBadge,
};
const CHAIN_TYPE_USD_CONVERSION = {
  solana: "solana",
  polygon: "matic-network",
  binance: "binancecoin",
};

const CHAIN_TITLE = {
  polygon: "Polygon Matic",
  binance: "BSC",
  Solana: "Solana",
  solana: "Solana",
  solona: "Solana",
};

const CHAIN_CURRENCY = {
  polygon: "MATIC",
  binance: "BNB",
  Solana: "SOL",
  solana: "SOL",
  solona: "SOL",
};

const CHAIN_NAME_BY_CHAIN_ID = {
  137: "polygon",
  80001: "0x13881",
  56: "bsc",
  97: "0x61",
};

const CHAIN_TITLE_BY_CHAIN_ID = {
  137: "polygon",
  80001: "polygon",
  56: "binance",
  97: "binance",
};

// The Content here is all dumy we will change this in future.
const NotificationDetailsOnType: any = {
  upBid: {
    title: "Your Bid is Low",
    description:
      "Someone has placed a higher bid than yours during auction. Try to get this NFT by placing a higher bid.",
  },
  claimPrice: {
    title: "Your NFT is Sold",
    description: "Your listed NFT has been sold. You may now claim your funds",
  },
  refundBid: {
    title: "Bid refund",
    description: "Your bid was unsuccessful. Please claim your refund",
  },
  claimNft: {
    title: "Auction Won",
    description:
      "Congratulations, you've won the auction. You're kindly requested to claim your NFT.",
  },
  bidWinner: {
    title: "Bid Winner",
    description:
      "Congratulations, you've won the bid, your nft will be transferred to you once owner will end its auction.",
  },

  addBid: {
    title: "Someone has placed a bid",
    description: "Good news, Someone has placed a bid on your auction",
  },
  auctionEnd: {
    title: "Auction Ended",
    description: "Your created auction has ended now",
  },
  reClaimNft: {
    title: "Re-Claim NFT",
    description:
      "Oh no! There was no bid on your auction. Please re-claim your listed nft. Don't lose hope try again",
  },
  noBidAuctionEnded: {
    title: "Auction Ended",
    description:
      "Oh no! There is no bid on your auction. Don't lose hope try again",
  },
  staked: {
    title: "Staked Tokens",
    description:
      "Congratulations, your staked tokens have now matured. You may now claim your rewards.",
  },
  successfulPurchase: {
    title: "Successfully Purchased",
    description: "Congratulations, you have successfully purchased a nft.",
  },
};

const getNotificationTitleAndDescription = (notification: any) => {
  return NotificationDetailsOnType[notification?.type];
};

const getUnreadNotification = (notifications: any[]) => {
  return notifications?.filter((notification) => !notification.isSeen) || [];
};

const getConvertedDateTime = (dateTime: string) => {
  const dateTimeArr = dateTime.split(" ");
  const date = dateTimeArr.slice(0, 4).join(" ");
  const time = dateTimeArr.slice(4, 5)[0].split(":").slice(0, 2).join(":");
  return { date, time };
};

const getNameOfSearchedItem = (item: any) => {
  return item?.fullName || item?.name || item?.walletAddress;
};
const getImageOfSearchedItem = (item: any) => {
  return item?.avatar || item?.image;
};
const getFormatedDayRemaining = (remainingHours: number) => {
  const days = Math.floor(remainingHours / 24);
  const remainderHours = remainingHours % 24;
  if (days === 0 && remainderHours > 0) {
    return `${remainderHours} Hours remaining`;
  }
  if (days === 0 && remainderHours === 0) {
    return "Less than hour remaining";
  }
  return `${
    days > 1 ? `${days} Days` : `${days} Day`
  } ${remainderHours} Hours remaining`;
};

const getSpecialCharacterReplaced = (str: string) => {
  if (str.includes("#")) {
    return str.replace("#", "%23");
  }
  return str;
};

const getUserFormatedUserBalance = (balance: any) => {
  if (balance === -1) {
    return "calculating...";
  }
  if (balance === 0) {
    return "Insufficent balance";
  }
  return getConvertedDecimalPrice(Number(balance));
};

const getFilterQueryForBackend = (
  selectedFilter: string,
  filteredValue: string,
  callingFrom: string,
  attributes: any
) => {
  let filterQuery = {};
  const exploreFilters = {
    panel1: {
      auctionType: filteredValue,
    },
    panel2: {
      blockchainType: { $regex: filteredValue, $options: "i" },
    },
    panel3: {
      "user.isVerified": true,
    },
    categories: {
      "nftId.properties.category": filteredValue,
    },
    attribute: {
      "nftId.attributes": attributes,
    },
  };
  const collectionFilters = {
    panel3: {
      isVerified: true,
    },
    panel2: {
      blockchainType: { $regex: filteredValue, $options: "i" },
    },
  };
  const profileFilters = {
    panel1: {
      $and: [
        { "activeAuction.status": "active" },
        { "activeAuction.auctionType": filteredValue },
      ],
    },
    panel2: {
      blockchainType: { $regex: filteredValue, $options: "i" },
    },
    categories: {
      "properties.category": filteredValue,
    },
    attribute: {
      attributes: attributes,
    },
  };
  const profileFilterForFraction = {
    panel1: {
      $or: [
        { nftType: "Fraction" },
        { "activeAuction.auctionType": "fractional" },
      ],
    },
  };
  if (callingFrom === "explore") {
    filterQuery = exploreFilters;
  }
  if (callingFrom === "collection") {
    filterQuery = collectionFilters;
  }
  if (callingFrom === "profile") {
    if (filteredValue === "fractional") {
      filterQuery = profileFilterForFraction;
    } else {
      filterQuery = profileFilters;
    }
  }
  if (filteredValue.includes("All")) {
    return "All";
  }

  return filterQuery[selectedFilter];
};

const getUserNameOrWalletAddress = (data: any) => {
  if (data?.userId?.fullName) return data?.userId?.fullName;
  if (data?.userId?.name) return data?.userId?.name;
  return walletAddressString(data?.userId?.walletAddress);
};

const getQueryForLastSeenUserSelection = (chat: any, currentUser: any) => {
  if (chat?.userId?._id === currentUser?.id) {
    return { "chatMetadata.toUserId.lastSeen": new Date() };
  }

  return { "chatMetadata.byUserId.lastSeen": new Date() };
};

const getChainNameByChainId = (chainId: number) => {
  if (chainId === 137 || chainId === 80001) return "polygon";
  return "binance";
};

const checkForExpendedOrNot = (
  listOfExpendedBoxes: String[],
  expendedBox: String
): boolean => {
  return listOfExpendedBoxes.filter((eb) => expendedBox === eb).length > 0;
};

const addExpandedValues = (
  previouslyExpanded: String[],
  newlyExpanded: String
) => {
  const alreadyExsist = previouslyExpanded.find(
    (expanded) => expanded === newlyExpanded
  );
  if (!alreadyExsist) {
    return [...previouslyExpanded, newlyExpanded];
  }
  return previouslyExpanded;
};

const removeAlreadyExpanded = (
  allExpanded: String[],
  expandedToBeRemoved: String
) => {
  return allExpanded.filter((expanded) => expanded !== expandedToBeRemoved);
};

const getConvertedDecimalPrice = (price: number) => {
  const conversionPrice = price?.toString();
  let count = 0;
  if (conversionPrice?.includes(".")) {
    const values = conversionPrice?.split(".");
    for (const number of values[1]?.split("")) {
      if (parseInt(number) === 0) {
        count++;
      }

      if (parseInt(values[0]) > 0 && count >= 2) {
        return values[0];
      }
      if (parseInt(number) > 0) {
        return price?.toFixed((count <= 1 ? 2 : count + 1) || 1);
      }
    }
  }
  return price;
};

const setPriceUptoThreeDecimal = (value, setPrice: Function) => {
  if (value.split(".").length === 2 && value.split(".")[1].length > 2) {
    return;
  }
  return setPrice(value);
};

const getFormatedDateForMessageCategory = (date: string) => {
  if (
    moment().subtract(1, "day").format("YYYY-MM-DD") ===
    moment(date).format("YYYY-MM-DD")
  )
    return "Yesterday";

  if (moment().format("YYYY-MM-DD") === date) return "Today";

  return moment(date).format("DD-MMM-YYYY");
};

const getEstimatedGasPriceFromGasStationPolygon = async () => {
  const gasPriceFromStation = await axios({
    method: "get",
    url: "https://gasstation-mumbai.matic.today/v2",
  });
  console.log("gasPriceFromStation", gasPriceFromStation?.data?.fast?.maxFee);

  if (gasPriceFromStation?.data) {
    return gasPriceFromStation?.data?.fast?.maxFee;
  }
  return false;
};

const getFileTypeFromUrl = async (imageUrl: string) => {
  try {
    const responseOfFile = await axios(imageUrl);

    const originalFileType = responseOfFile?.headers?.["content-type"] || null;

    if (!originalFileType) throw new Error("File Type not Found");

    if (originalFileType?.includes("image")) {
      if (originalFileType?.includes("gif")) {
        return "gif";
      }
      return "image";
    }
    if (originalFileType?.includes("video")) {
      return "video";
    }
    if (originalFileType?.includes("audio")) {
      return "audio";
    }
    return "vr";
  } catch (err) {
    console.log(
      "🚀 ~ file: helpers.ts ~ line 334 ~ getFileTypeFromUrl ~ err",
      err
    );
    throw err;
  }
};

const extractErrorMessage = (err: string | any) => {
  try {
    if (err?.message && !err?.message?.includes("{")) {
      return err?.message;
    }

    const convertedErr = err?.message
      ?.replace(/\r?\n|\r/g, " ")
      .replace(".", " ")
      ?.split(" ");

    const extractObject = JSON.parse(
      convertedErr
        .slice(convertedErr.indexOf("{"), convertedErr.indexOf("}") + 1)
        .join(" ")
    );

    return extractObject?.message;
  } catch (error) {
    console.log(
      "🚀 ~ file: helpers.ts ~ line 384 ~ extractErrorMessage ~ error",
      error
    );
    return err;
  }
};

export {
  CHAIN_LOGOS,
  CHAIN_TITLE,
  CHAIN_CURRENCY,
  CHAIN_NAME_BY_CHAIN_ID,
  CHAIN_TITLE_BY_CHAIN_ID,
  CHAIN_TYPE_USD_CONVERSION,
  getNotificationTitleAndDescription,
  getUnreadNotification,
  getConvertedDateTime,
  getNameOfSearchedItem,
  getImageOfSearchedItem,
  getFormatedDayRemaining,
  getSpecialCharacterReplaced,
  getUserFormatedUserBalance,
  getFilterQueryForBackend,
  getUserNameOrWalletAddress,
  getQueryForLastSeenUserSelection,
  getChainNameByChainId,
  checkForExpendedOrNot,
  addExpandedValues,
  removeAlreadyExpanded,
  getConvertedDecimalPrice,
  getFormatedDateForMessageCategory,
  getEstimatedGasPriceFromGasStationPolygon,
  setPriceUptoThreeDecimal,
  getFileTypeFromUrl,
  extractErrorMessage,
};
