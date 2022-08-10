import { createSlice } from "@reduxjs/toolkit";

import { AppThunk, RootState } from "../store";
import axios from "axios";

import { solToUSD } from "utils/helpers/solToDollarsPrice";

export interface ErrorMessage {
  message: string;
}
export interface ActivityState {
  actitives?: [];
  totalUserActivityPages?: Number;
  totalCollectionActivityPages?: Number;
  collectionActivities?: [];
  isLoading: boolean;
  error: ErrorMessage;
}

export const initialState: ActivityState = {
  isLoading: false,
  error: { message: "An Error occurred" },
};

export const activitySlice = createSlice({
  name: "createActivity",
  initialState,
  reducers: {
    setCollectionActivities: (state, { payload }) => {
      state.collectionActivities = payload.docs;
      state.totalCollectionActivityPages = payload.totalPages;
    },
    setLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
    setActivity: (state, payload) => {
      state.actitives = payload.payload.docs;
      state.totalUserActivityPages = payload.payload.totalPages;
    },
    setFailed: (state, { payload }) => {
      state.error = payload;
    },
  },
});

export const getCollectionActivity =
  (page: number, collectionId: string): AppThunk =>
  async (dispatch) => {
    try {
      const res = await axios({
        method: "get",
        url:
          process.env.REACT_APP_BASE_URL + "activity/getCollectionActivities",
        params: {
          page,
          collectionId,
        },
      });
      const data = await res.data;
      return data;
    } catch (error) {
      dispatch(setFailed(error));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const getOwnActivity =
  (page: number, userId: string): AppThunk =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      let res = await axios({
        method: "get",
        url: process.env.REACT_APP_BASE_URL + "activity/getOwnActivity",
        params: {
          page,
          userId,
        },
      });
      let data = await res.data;
      return data;
    } catch (error) {
      dispatch(setFailed(error));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const getNftPriceHistory =
  (nftId: string, selectedDate: any): AppThunk =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + `nft/getNftPriceHistory/${nftId}`,
        data: { selectedDate: selectedDate },
      });
      let data = await res.data;
      return data;
    } catch (error) {
      console.log("getNftPriceHistory error =====", error);
    }
  };

export const addActivity =
  (activityData: any): AppThunk =>
  async (dispatch) => {
    const authToken = localStorage.getItem("authToken") || "";
    dispatch(setLoading(true));
    try {
      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + "activity/addActivity",
        data: activityData,
        headers: {
          "x-auth-token": authToken,
        },
      });
      let data = await res.data;
      return data;
    } catch (error) {
      dispatch(setFailed(error));
    }
  };

export const trendingNfts = (): AppThunk => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    let res = await axios({
      method: "get",
      url: process.env.REACT_APP_BASE_URL + "activity/getTrendingNft",
    });
    let data = await res.data;
    return data;
  } catch (error) {
    dispatch(setFailed(error));
  }
};

export const topCollection =
  (days: number): AppThunk =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      let res = await axios({
        method: "get",
        url: process.env.REACT_APP_BASE_URL + "activity/getTopCollection",
        params: { days: days },
      });
      let data = await res.data;
      return data;
    } catch (error) {
      dispatch(setFailed(error));
    }
  };

export const getNftOwnersList =
  (nftId: string): AppThunk =>
  async (dispatch) => {
    const authToken = localStorage.getItem("authToken") || "";
    dispatch(setLoading(true));
    try {
      const res = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + "activity/getNftOwners",
        headers: {
          "x-auth-token": authToken,
        },
        data: { nftId: nftId },
      });
      let { data, ...otherValues } = await res.data;
      const finalData = [];
      for (const owner of data) {
        const usdPrice = await solToUSD(
          owner?.price,
          owner?.nftId?.blockchainType?.toLowerCase()
        );
        finalData.push({ ...owner, usdPrice });
      }

      return { ...otherValues, data: finalData };
    } catch (error) {
      console.log("getNftOwners error =====", error);
    }
  };
export const { setLoading, setFailed, setActivity, setCollectionActivities } =
  activitySlice.actions;

export default activitySlice.reducer;
