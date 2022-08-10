import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { AppThunk, RootState } from "../store";
import { solToUSD } from "../../utils/helpers/solToDollarsPrice";
import { getTaxationAmount } from "utils/helpers/customTokenAuctionUtils";
import { getCurrentPrice } from "utils/helpers/getCurrentPrice";
export interface AuthError {
  message: string;
}

export interface AuthState {
  isAuth: boolean;
  currentUser?: CurrentUser;
  isLoading: boolean;
  error: AuthError;
  token?: string;
}

export interface CurrentUser {
  _id?: string;
  name?: string;
  discription?: string;
  url?: string;
  walletAddress?: string;
  email?: string;
  avatar?: string;
  cover?: string;
  communityLinks?: Array<any>;
}
export const initialState: AuthState = {
  isAuth: false,
  isLoading: false,
  error: { message: "An Error occurred" },
};

export const auctionReducder = createSlice({
  name: "auth",
  initialState,
  reducers: {},
});

export const createAuctionAction =
  (auctionData: any): AppThunk =>
  async () => {
    const authToken = localStorage.getItem("authToken") || "";

    try {
      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + "auction/addAuction",
        data: auctionData,
        headers: {
          "x-auth-token": authToken,
        },
      });

      let data = res.data;
      return data;
    } catch (error) {
      console.log("Auction create error ======", error);
    }
  };

export const getAllActiveAuctions =
  (filter: any, page: number): AppThunk =>
  async () => {
    const authToken = localStorage.getItem("authToken") || "";

    try {
      let res = await axios({
        method: "get",
        url:
          process.env.REACT_APP_BASE_URL +
          "auction/getAllActiveAuction?page=" +
          page +
          "&limit=" +
          12 +
          "&filter=" +
          // filter,
          JSON.stringify(filter),
        headers: {
          "x-auth-token": authToken,
        },
      });

      let data = res.data;
      return data;
    } catch (error) {
      console.log("All auction data error ======", error);
    }
  };

export const getSearchResults =
  (filter: any): AppThunk =>
  async () => {
    try {
      let res = await axios({
        method: "get",
        url:
          process.env.REACT_APP_BASE_URL +
          "auction/getSearchResults?filter=" +
          JSON.stringify(filter),
      });

      const data = res.data;
      return data;
    } catch (error) {
      console.log("All Search data error ======", error);
    }
  };

export const getSomeSearchResults =
  (name: string): AppThunk =>
  async () => {
    try {
      let res = await axios({
        method: "get",
        url:
          process.env.REACT_APP_BASE_URL +
          "auction/getSomeSearchResults?name=" +
          name,
      });

      const data = res.data;
      return data;
    } catch (error) {
      console.log("All Search data error ======", error);
    }
  };

export const getNftAuction =
  (nftId: string): AppThunk =>
  async () => {
    const authToken = localStorage.getItem("authToken") || "";
    const authUser = localStorage.getItem("authUser") || "";
    let userId = "";
    if (authUser) {
      const userData = await JSON.parse(authUser);
      userId = await userData?._id;
    }

    try {
      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + "auction/getNftAuction",
        data: { nftId: nftId },
        headers: {
          "x-auth-token": authToken,
        },
      });

      let data = res.data;

      return data;
    } catch (error) {
      console.log("Nft Auction Data error ======", error);
    }
  };

export const updateNftOwner =
  (nftId: string, userId: any): AppThunk =>
  async () => {
    const authToken = localStorage.getItem("authToken") || "";

    try {
      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + `nft/updateNftOwner/${nftId}`,
        data: userId,
        headers: {
          "x-auth-token": authToken,
        },
      });

      let data = res.data;
      return data;
    } catch (error) {
      console.log("update nft owner error ======", error);
    }
  };

export const updateNft =
  (nftId: string, updateNft: any): AppThunk =>
  async () => {
    const authToken = localStorage.getItem("authToken") || "";

    try {
      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + `nft/updateNft/${nftId}`,
        data: updateNft,
        headers: {
          "x-auth-token": authToken,
        },
      });

      let data = res.data;
      return data;
    } catch (error) {
      console.log("bid Data error ======", error);
    }
  };

export const updateAuction =
  (auctionId: string, auctionData: any): AppThunk =>
  async () => {
    const authToken = localStorage.getItem("authToken") || "";

    try {
      let res = await axios({
        method: "post",
        url:
          process.env.REACT_APP_BASE_URL + `auction/updateAuction/${auctionId}`,
        data: auctionData,
        headers: {
          "x-auth-token": authToken,
        },
      });

      let data = res.data;
      return data;
    } catch (error) {
      console.log("bid Data error ======", error);
    }
  };

export const placeBid =
  (bidData: any): AppThunk =>
  async () => {
    const authToken = localStorage.getItem("authToken") || "";

    try {
      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + "bid/addBid",
        data: bidData,
        headers: {
          "x-auth-token": authToken,
        },
      });

      let data = res.data;
      return data;
    } catch (error) {
      console.log("bid Data error ======", error);
    }
  };

export const getBid =
  (bidId: string): AppThunk =>
  async () => {
    const authToken = localStorage.getItem("authToken") || "";

    try {
      let res = await axios({
        method: "get",
        url: process.env.REACT_APP_BASE_URL + `bid/getBid/${bidId}`,
        headers: {
          "x-auth-token": authToken,
        },
      });

      let data = res.data;

      return data;
    } catch (error) {
      console.log("bid Data error ======", error);
    }
  };

export const updateBid =
  (bidId: string, bidData: any): AppThunk =>
  async () => {
    const authToken = localStorage.getItem("authToken") || "";

    try {
      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + `bid/updateBid/${bidId}`,
        data: bidData,
        headers: {
          "x-auth-token": authToken,
        },
      });

      let data = res.data;
      return data;
    } catch (error) {
      console.log("bid Data error ======", error);
    }
  };

export const getAuction =
  (auctionId: string): AppThunk =>
  async () => {
    const authToken = localStorage.getItem("authToken") || "";

    try {
      let res = await axios({
        method: "get",
        url: process.env.REACT_APP_BASE_URL + `auction/getAuction/${auctionId}`,
        data: { auctionId },
        headers: {
          "x-auth-token": authToken,
        },
      });

      let data = res.data;

      const priceInSol = getCurrentPrice(
        data,
        data?.nftId,
        data?.bids.sort((pre, next) => next?.price - pre?.price)
      );

      const platformFeeInUSD = await solToUSD(
        getTaxationAmount({ transactionAmount: priceInSol || 0 }),data?.blockchainType?.toLowerCase()
      );
      const auctionPriceInUSD = await solToUSD(priceInSol || 0,data?.blockchainType?.toLowerCase());
      data["platformFeeInUSD"] = platformFeeInUSD || 0;
      data["auctionPriceInUSD"] = auctionPriceInUSD || 0;

      return data;
    } catch (error) {
      console.log("auction Data error ======", error);
    }
  };

export const getAuctionBids =
  (auctionId: string): AppThunk =>
  async () => {
    const authToken = localStorage.getItem("authToken") || "";

    try {
      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + "bid/getAllAuctionBids",
        data: { auctionId },
        headers: {
          "x-auth-token": authToken,
        },
      });

      let data = res.data;

      return data;
    } catch (error) {
      console.log("bid Data error ======", error);
    }
  };

export const checkForAuctionAlreadyProcessedOrNot =
  (auctionId: string, selectedFraction: any): AppThunk =>
  async () => {
    const authToken = localStorage.getItem("authToken") || "";

    try {
      let res = await axios({
        method: "post",
        url:
          process.env.REACT_APP_BASE_URL +
          "auction/auctionUnderProcess/" +
          auctionId,
        data: {
          selectedFraction,
        },

        headers: {
          "x-auth-token": authToken,
          "Content-Type": "application/json",
        },
      });

      let data = res.data;

      return data;
    } catch (error) {
      console.log("🚀 ~ file: auctionReducer.ts ~ line 374 ~ error", error);
    }
  };

export const updateAuctionProcessingOnError =
  (auctionId: string, selectedFraction: any): AppThunk =>
  async () => {
    const authToken = localStorage.getItem("authToken") || "";

    try {
      let res = await axios({
        method: "post",
        url:
          process.env.REACT_APP_BASE_URL +
          "auction/updateAuctionProcessingOnError/" +
          auctionId,
        data: {
          selectedFraction,
        },
        headers: {
          "x-auth-token": authToken,
          "Content-Type": "application/json",
        },
      });

      let data = res.data;

      return data;
    } catch (error) {
      console.log("🚀 ~ file: auctionReducer.ts ~ line 400 ~ error", error);
    }
  };

export const {} = auctionReducder.actions;

export const authSelector = (state: RootState) => state;

export default auctionReducder.reducer;
