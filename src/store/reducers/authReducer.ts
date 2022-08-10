import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import React from "react";
import { checkForMetamaskNetwork } from "web3/web3";
import { AppThunk, RootState } from "../store";
import { getMyCollected } from "./nftReducer";

export interface AuthError {
  message: string;
}

export interface AuthState {
  isAuth: boolean;
  currentUser?: CurrentUser;
  isLoading: boolean;
  isSelectedChatLoading: boolean;
  error: AuthError;
  currentPQLBalance: number;
  token?: string;
  appTheme?: string;
  currentEthBalance: number;
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
  nftCount?: string;
  chainType?: string;
  collectionCount?: string;
  favouriteCount?: string;
  communityLinks?: Array<any>;
}
export const initialState: AuthState = {
  isAuth: false,
  isLoading: false,
  isSelectedChatLoading: false,
  error: { message: "An Error occurred" },
  currentPQLBalance: -1,
  appTheme: "dark-theme",
  currentEthBalance: -1,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAppTheme: (state, { payload }) => {
      state.appTheme = payload;
    },
    setLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
    setAuthSuccess: (state, payload) => {
      state.currentUser = payload.payload;
    },
    setAuthLoginSuccess: (state, payload) => {
      const data = payload.payload.user;

      let communityLinks = [];

      const currentUserData = {
        id: data?._id,
        name: data?.fullName,
        url: data?.url,
        description: data?.description,
        avatar: data?.avatar,
        cover: data?.cover,
        walletAddress: data?.walletAddress,
        createdAt: data?.createdAt,
        chainType: data?.chainType,
        nftCount: data?.nftCount,
        collectionCount: data?.collectionCount,
        favouriteCount: data?.favouriteCount,
        communityLinks: [],
      };
      state.currentUser = currentUserData;
      state.token = payload.payload.token;
      state.isAuth = true;
    },
    setLogOut: (state) => {
      state.isAuth = false;
      state.currentUser = undefined;
      state.token = undefined;
      state.isLoading = false;
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      state.currentPQLBalance = -1;
    },
    setAuthFailed: (state, { payload }) => {
      state.error = payload;
      state.isAuth = false;
    },
    setFailed: (state, { payload }) => {
      state.error = payload;
    },
    setCurrentPQLBalance: (state, { payload }) => {
      state.currentPQLBalance = payload;
    },
    setIsSelectedChatLoading: (state, { payload }) => {
      state.isSelectedChatLoading = payload;
    },
    setCurrentEthBalance: (state, { payload }) => {
      state.currentEthBalance = payload;
    },
  },
});

export const login =
  (
    walletAddressPublicKey: string,
    signature: string,
    chainType: string = "solana"
  ): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(setLoading(true));
      if (walletAddressPublicKey) {
        // dispatch(setWalletAddress(walletAddressPublicKey));
        let res = await axios({
          method: "post",
          url: process.env.REACT_APP_BASE_URL + "user/auth",
          data: { walletAddress: walletAddressPublicKey, signature, chainType },
          headers: { Accept: "application/json" },
        });
        let data = res.data;
        const hasKey = "isBlocked" in data?.user;
        if (!data?.user?.chainType) {
          data.user.chainType = "solana";
        }
        if (data?.user?.isBlocked === false || hasKey === false) {
          if (data?.user?.chainType?.toLowerCase() !== "solana") {
            const networkSwitched = await checkForMetamaskNetwork(
              data?.user?.chainType
            );

            if (!networkSwitched) return false;
          }

          if (data.token) {
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("authUser", JSON.stringify(data.user));
            dispatch(setAuthLoginSuccess(data));
          }
          return data;
        } else {
          dispatch(setAuthFailed("User is blocked by admin."));
          return false;
        }
      }
    } catch (error) {
      dispatch(setAuthFailed(error));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const getUserProfile = (): AppThunk => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const authToken = localStorage.getItem("authToken") || "";
    const res = await axios({
      method: "get",
      url: process.env.REACT_APP_BASE_URL + "user/getUserDetail",
      headers: {
        "x-auth-token": authToken,
      },
    });
    const data = await res.data;

    let communityLinks = [];
    if (data?.communityLinks) {
      communityLinks = await JSON.parse(data?.communityLinks);
    }
    const currentUserData = {
      id: data?._id,
      name: data?.fullName,
      url: data?.url,
      description: data?.description,
      avatar: data?.avatar,
      cover: data?.cover,
      walletAddress: data?.walletAddress,
      createdAt: data?.createdAt,
      nftCount: data?.nftCount,
      collectionCount: data?.collectionCount,
      favouriteCount: data?.favouriteCount,
      chainType: data?.chainType,
      communityLinks: communityLinks,
    };
    dispatch(setAuthSuccess(currentUserData));
  } catch (error) {
    dispatch(setFailed(error));
  } finally {
    dispatch(setLoading(false));
  }
};
export const updateUserProfile =
  (formData: any): AppThunk =>
  async (dispatch) => {
    const authToken = localStorage.getItem("authToken") || "";
    try {
      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + "user/editUserDetail",
        data: formData,
        headers: {
          "x-auth-token": authToken,
        },
      });
      let data = res.data;
      let communityLinks = JSON.parse(data?.communityLinks);
      let currentUserData = {
        id: data?._id,
        name: data?.fullName,
        url: data?.url,
        description: data?.description,
        avatar: data?.avatar,
        cover: data?.cover,
        nftCount: data?.nftCount,
        collectionCount: data?.collectionCount,
        favouriteCount: data?.favouriteCount,
        communityLinks: communityLinks,
      };
      dispatch(setAuthSuccess(currentUserData));
      return currentUserData;
    } catch (error) {
      dispatch(setFailed(error));
      return false;
    }
  };

export const logOut = (): AppThunk => async (dispatch) => {
  try {
    const authToken = localStorage.getItem("authToken") || "";

    const res: any = await axios({
      method: "post",
      url: process.env.REACT_APP_BASE_URL + "auth/logout",
      headers: {
        "x-auth-token": authToken,
      },
    });
    return res?.data;
  } catch (err) {
    console.log("🚀 ~ file: authReducer.ts ~ line 222 ~ logOut ~ err", err);
  }
};

export const {
  setAuthSuccess,
  setLogOut,
  setLoading,
  setAuthLoginSuccess,
  setAuthFailed,
  setFailed,
  setCurrentPQLBalance,
  setIsSelectedChatLoading,
  setAppTheme,
  setCurrentEthBalance,
} = authSlice.actions;

export const authSelector = (state: RootState) => state;

export default authSlice.reducer;
