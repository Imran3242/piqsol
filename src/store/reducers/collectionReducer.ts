import { createSlice } from "@reduxjs/toolkit";

import { AppThunk, RootState } from "../store";
import axios from "axios";
import { AnyRecord } from "dns";

export interface ErrorMessage {
  message: string;
}
export interface Collection {
  _id?: String;
  userId?: String;
  fullName?: String;
  avatar?: String;
  cover?: String;
  communityLinks?: [];
  description?: String;
  url?: String;
}
export interface CollectionState {
  currentCollection?: Collection;
  collections?: Collection[];
  isLoading: boolean;
  error: ErrorMessage;
}

export const initialState: CollectionState = {
  isLoading: false,
  error: { message: "An Error occurred" },
};

export const collectionSlice = createSlice({
  name: "createCollection",
  initialState,
  reducers: {
    setLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
    setCurrentCollectionSuccess: (state, { payload }) => {
      state.currentCollection = payload;
    },

    setCollections: (state, payload) => {
      state.collections = payload.payload;
    },
    setFailed: (state, { payload }) => {
      state.error = payload;
    },
  },
});

export const createCollection =
  (formData: any): AppThunk =>
  async (dispatch) => {
    const authToken = localStorage.getItem("authToken") || "";

    try {
      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + "collection/addCollection",
        data: formData,
        headers: {
          "x-auth-token": authToken,
        },
      });
      let data = res.data;
      return data;
    } catch (error) {
      dispatch(setFailed(error));
    }
  };

export const getMyCreatedCollections =
  (userId: string): AppThunk =>
  async (dispatch) => {
    // const authToken = localStorage.getItem("authToken") || "";
    dispatch(setLoading(true));
    try {
      let res = await axios({
        method: "get",
        url: `${process.env.REACT_APP_BASE_URL}collection/getOwnCollections?id=${userId}`,
      });
      let data = res.data;
      dispatch(setCollections(data));
    } catch (error) {
      dispatch(setFailed(error));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const getCollectionDetail =
  (collectionId: any): AppThunk =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      let res = await axios({
        method: "get",
        url: `${process.env.REACT_APP_BASE_URL}collection/getCollectionById/${collectionId}`,
      });
      let data = res.data;
      return data;
    } catch (error) {
      dispatch(setFailed(error));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const moreNftFromCollection =
  (collectionId: any): AppThunk =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      let res = await axios({
        method: "get",
        url: `${process.env.REACT_APP_BASE_URL}collection/moreNftFromCollection/${collectionId}`,
      });
      let data = res.data;
      return data;
    } catch (error) {
      dispatch(setFailed(error));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const getCollectionNfts =
  (
    collectionId: any,
    selectedfilter: any,
    page: any,
    limit: number
  ): AppThunk =>
  async (dispatch) => {
    // const authToken = localStorage.getItem("authToken") || "";
    dispatch(setLoading(true));
    try {
      let res = await axios({
        method: "get",
        url: `${
          process.env.REACT_APP_BASE_URL
        }collection/getNftsByCollection/${collectionId}?page=${page}&limit=${limit}&filter=${JSON.stringify(
          selectedfilter
        )}`,
        // headers: {
        //   "x-auth-token": authToken,
        // },
      });
      let data = res.data;
      // dispatch(setCollections(data.docs));
      return data;
    } catch (error) {
      dispatch(setFailed(error));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const getAllCollections =
  (filter: any, page, limit): AppThunk =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const res = await axios({
        method: "get",
        url: `${
          process.env.REACT_APP_BASE_URL
        }listing/getAllCollectionUser?page=${page}&limit=${limit}&filter=${JSON.stringify(
          filter
        )}`,
      });
      return res?.data;
    } catch (err) {
      console.log("Error in Getting ALl collections", err);
    } finally {
      dispatch(setLoading(false));
    }
  };

export const {
  setCurrentCollectionSuccess,
  setLoading,
  setFailed,
  setCollections,
} = collectionSlice.actions;

export default collectionSlice.reducer;
