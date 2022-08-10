import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { AppThunk, RootState } from "../store";

export interface AuthError {
  message: string;
}

export interface UserState {
  isAuth: boolean;
  users?: CurrentUser[];
  isLoading: boolean;
  error: AuthError;
  token?: string;
}

export interface CurrentUser {
  id?: string;
  fullName?: string;
  discription?: string;
  url?: string;
  walletAddress?: string;
  email?: string;
  avatar?: string;
  cover?: string;
  nftCount?: string;
  favouriteCount?: string;
  collectionCount?: string;
  // communityLinks?: [];
}
export const initialState: UserState = {
  isAuth: false,

  isLoading: false,
  error: { message: "An Error occurred" },
};

export const userSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
    setUsers: (state, { payload }) => {
      state.users = payload;
    },
    setFailed: (state, { payload }) => {
      state.error = payload;
    },
  },
});

export const getAllUsers = (): AppThunk => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const authToken = localStorage.getItem("authToken") || "";
    let res = await axios({
      method: "get",
      url: process.env.REACT_APP_BASE_URL + "user/getAllUsers",
      headers: {
        "x-auth-token": authToken,
      },
    });
    let data = res.data;
    dispatch(setUsers(data));
  } catch (error) {
    dispatch(setFailed(error));
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchUserDetails =
  (userId: string): AppThunk =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      let res = await axios({
        method: "get",
        url: `${process.env.REACT_APP_BASE_URL}user/getUserById/${userId}`,
      });
      let data = res.data;
      return data;
    } catch (error) {
      dispatch(setFailed(error));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const getUserMintsArray = (): AppThunk => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const authToken = localStorage.getItem("authToken") || "";
    let res = await axios({
      method: "get",
      url: process.env.REACT_APP_BASE_URL + "nft/getUserMintsArray",
      headers: {
        "x-auth-token": authToken,
      },
    });
    let data = res.data;
    return data;
  } catch (error) {
    dispatch(setFailed(error));
  } finally {
    dispatch(setLoading(false));
  }
};
export const userAccountSupport =
  (formData: any): AppThunk =>
  async (dispatch) => {
    const authToken = localStorage.getItem("authToken") || "";
    try {
      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + "user/userAccountSupport",
        data: formData,
        headers: {
          "x-auth-token": authToken,
        },
      });
      const data = res.data;
      return data;
    } catch (error) {
      console.log("getUserUnSeenNotification error", JSON.stringify(error));
    }
  };

export const addSolToPiqsolConversionTransaction =
  (payload: any): AppThunk =>
  async (dispatch) => {
    const authToken = localStorage.getItem("authToken") || "";
    try {
      const res = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + "buyPiqsol/addTransaction",
        data: { data: payload },
        headers: {
          "x-auth-token": authToken,
        },
      });
      const data = res.data;
      return data;
    } catch (err) {
      console.log("🚀 ~ file: userReducer.ts ~ line 137 ~ err", err);
    }
  };

export const getUserNonceByWalletAddress = async (walletAddress: string, selectedBlockChainType) => {
  try {
    const res = await axios({
      method: "post",
      url: `${process.env.REACT_APP_BASE_URL}user/nonce`,
      headers: {
        "Content-Type": "application/json",
      },
      data: { walletAddress, chainType: selectedBlockChainType },
    });
    console.log(
      "🚀 ~ file: userReducer.ts ~ line 166 ~ getUserNonceByWalletAddress ~ res",
      res
    );

    return {
      success: res?.data?.success,
      data: res?.data?.data,
      mainData: res?.data,
    };
  } catch (err) {
    console.log(
      "🚀 ~ file: user.api.ts ~ line 6 ~ UserAPI ~ getUserNonceByWalletAddress ~ err",
      err
    );

    throw err?.response?.data;
  }
};

export const updateSignedNonceByWalletAddress = async (
  walletAddress: string,
  nonce: number
) => {
  try {
    const res = await axios({
      method: "post",
      url: `${process.env.REACT_APP_BASE_URL}user/updateNonce`,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        walletAddress,
        nonce,
      },
    });
  } catch (err) {
    console.log("🚀 ~ file: userReducer.ts ~ line 194 ~ err", err);
  }
};

export const getUserNFTs = (): AppThunk => async (dispatch) => {
  try {
    const authToken = localStorage.getItem("authToken") || "";
    const res = await axios({
      method: "get",
      url: `${process.env.REACT_APP_BASE_URL}nft/allNftsByUserId`,
      headers: {
        "x-auth-token": authToken,
      },
    });
    return res.data;
  } catch (err) {
    console.log(
      "🚀 ~ file: userReducer.ts ~ line 211 ~ getUserNFTs ~ err",
      err
    );
  }
};

export const { setUsers, setLoading, setFailed } = userSlice.actions;

export default userSlice.reducer;
