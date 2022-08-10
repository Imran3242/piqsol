import { createSlice } from "@reduxjs/toolkit";

import { AppThunk, RootState } from "../store";
import axios from "axios";
import { getTaxationAmount } from "utils/helpers/customTokenAuctionUtils";
import { solToUSD } from "utils/helpers/solToDollarsPrice";

export interface ErrorMessage {
  message: string;
}
export interface nft {
  _id: String;
  userId: String;
  assetUrl: String;
  key: Number;
  mint: String;
  name: String;
  artistName: String;
  symbol: String;
  description: String;
  seller_fee_basis_points: Number;
  image: String;
  external_url: String;
  properties: Object;
  creators: [];
  primarySaleHappened: Number;
  isMutable: Number;
  editionNonce: Number;
  tokenStandard: Number;
}
export interface NftState {
  nfts?: nft[];
  isLoading: boolean;
  error: ErrorMessage;
}

export const initialState: NftState = {
  isLoading: false,
  error: { message: "An Error occurred" },
};

export const nftSlice = createSlice({
  name: "createNft",
  initialState,
  reducers: {
    setLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
    setNfts: (state, payload) => {
      state.nfts = payload.payload;
    },
    setFailed: (state, { payload }) => {
      state.error = payload;
    },
  },
});

export const getMyCollected =
  (filter: any = {}, page: number = 1, userId: string): AppThunk =>
  async (dispatch) => {
    const authToken = localStorage.getItem("authToken") || "";
    dispatch(setLoading(true));
    try {
      let res = await axios({
        method: "get",
        url:
          process.env.REACT_APP_BASE_URL +
          `nft/getAllNftData?userId=${userId}&page=${page}&filter=${JSON.stringify(
            filter
          )}`,
        headers: {
          "x-auth-token": authToken,
        },
      });
      let data = res.data;
      // dispatch(setNfts(data?.docs));
      return data;
    } catch (error) {
      dispatch(setFailed(error));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const getAllNftCollection =
  (filter: any = {}, page: number = 1): AppThunk =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      let res = await axios({
        method: "get",
        url: process.env.REACT_APP_BASE_URL + "nft/getAllNftCollection",
        params: { page: page, filter: JSON.stringify(filter) },
      });
      let data = res.data;
      // dispatch(setNfts(data));
      return data;
    } catch (error) {
      dispatch(setFailed(error));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const addNft =
  (data: any): AppThunk =>
  async (dispatch) => {
    const authToken = localStorage.getItem("authToken") || "";
    dispatch(setLoading(true));
    try {
      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + "nft/addNft",
        data,
        headers: {
          "x-auth-token": authToken,
        },
      });
      let respnseData = res;
      return respnseData;
    } catch (error) {
      dispatch(setFailed(error));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const getNftDetails =
  (id: string): AppThunk =>
  async (dispatch) => {
    const authToken = localStorage.getItem("authToken") || "";
    dispatch(setLoading(true));
    try {
      let res = await axios({
        method: "get",
        url: process.env.REACT_APP_BASE_URL + "nft/getNftDetail",
        params: {
          id,
        },
        headers: {
          "x-auth-token": authToken,
        },
      });
      const data = res.data;

      return data;
    } catch (error) {
      dispatch(setFailed(error));
    }
  };

export const storeMyCollected = (): AppThunk => async (dispatch) => {
  const authToken = localStorage.getItem("authToken") || "";
  dispatch(setLoading(true));
  try {
    let res = await axios({
      method: "get",
      url: process.env.REACT_APP_BASE_URL + "nft/storeAllNftData",
      headers: {
        "x-auth-token": authToken,
      },
    });
    let data = res.data;
  } catch (error) {
    dispatch(setFailed(error));
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchNftMetaDataFromUri =
  (uri: string): AppThunk =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      let res = await axios({
        method: "get",
        url: uri,
      });
      let data = res.data;

      return data;
    } catch (error) {
      dispatch(setFailed(error));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const { setLoading, setFailed, setNfts } = nftSlice.actions;

export default nftSlice.reducer;
