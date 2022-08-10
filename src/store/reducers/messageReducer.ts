import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { AppThunk, RootState } from "../store";
import { solToUSD } from "../../../src/utils/helpers/solToDollarsPrice";
export interface MessageError {
  message: string;
}

export interface MessageState {
  latestMassage?: LatestMessageState;
  unReadMessages: number;
  isLoading?: boolean;
  previousChat: any;
  userPayment?: {};
  error?: MessageError;
}

export interface LatestMessageState {
  _id?: string;
  sendByUserId?: string;
  sendToUserId?: string;
  content?: string;
}

export const initialState: MessageState = {
  isLoading: false,
  previousChat: undefined,
  unReadMessages: 0,
  error: { message: "An Error occurred" },
};

export const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
    setLatestMessage: (state, payload) => {
      state.latestMassage = payload.payload;
    },

    setUserPayment: (state, payload) => {
      state.userPayment = payload.payload;
    },
    setFailed: (state, { payload }) => {
      state.error = payload;
    },
    setUnReadMessages: (state, { payload }) => {
      state.unReadMessages = payload;
    },
    setPreviousChat: (state, { payload }) => {
      state.previousChat = payload;
    },
  },
});

export const checkPayment =
  (nftId: string): AppThunk =>
  async (dispatch) => {
    const authToken = localStorage.getItem("authToken") || "";
    dispatch(setLoading(true));
    try {
      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + "payment/getPayment",
        data: {
          nftId: nftId,
        },
        headers: {
          "x-auth-token": authToken,
        },
      });
      const data = res.data;
      dispatch(setUserPayment(data));
    } catch (error) {
      dispatch(setFailed(error));
    }
  };

export const userPaymentAction =
  (
    nftId: string,
    chatWithUserId: string,
    userId: string,
    amount: number,
    transactionSignature: string,
    paymentType: string
  ): AppThunk =>
  async (dispatch) => {
    const authToken = localStorage.getItem("authToken") || "";
    dispatch(setLoading(true));
    try {
      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + "payment/addPayment",
        data: {
          nftId: nftId,
          chatWithUserId,
          userId,
          amount,
          transactionSignature: transactionSignature,
          paymentType,
        },
        headers: {
          "x-auth-token": authToken,
        },
      });
      const data = await res.data;
      dispatch(setUserPayment(data));
    } catch (error) {
      dispatch(setFailed(error));
    }
  };

export const getChatUsers =
  (chatWith = "", nftId = ""): AppThunk =>
  async (dispatch) => {
    const authToken = localStorage.getItem("authToken") || "";
    dispatch(setLoading(true));
    try {
      let res = await axios({
        method: "get",
        url:
          process.env.REACT_APP_BASE_URL +
          "payment/getChatPaymentByUser/" +
          chatWith +
          "/" +
          nftId,
        // data: {
        //   chatWith,
        // },
        headers: {
          "x-auth-token": authToken,
        },
      });
      const data = await res.data;
      return data;
    } catch (error) {
      dispatch(setFailed(error));
    }
  };

export const getNotExpiredChats = (): AppThunk => async (dispatch) => {
  const authToken = localStorage.getItem("authToken") || "";
  dispatch(setLoading(true));
  try {
    let res = await axios({
      method: "get",
      url: process.env.REACT_APP_BASE_URL + "payment/getNotExpiredChats",
      headers: {
        "x-auth-token": authToken,
      },
    });

    const data = await res.data;

    return data;
  } catch (error) {
    dispatch(setFailed(error));
  }
};

export const getLatestMessage =
  (chatId: string): AppThunk =>
  async (dispatch) => {
    const authToken = localStorage.getItem("authToken") || "";
    dispatch(setLoading(true));
    try {
      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + "message/getLatestMessage",

        headers: {
          "x-auth-token": authToken,
        },
        data: { chatId: chatId },
      });
      const data = await res.data;
      return data;
    } catch (error) {
      dispatch(setFailed(error));
    }
  };

export const getIsReadMessageCount = (): AppThunk => async (dispatch) => {
  const authToken = localStorage.getItem("authToken") || "";
  dispatch(setLoading(true));
  try {
    let res = await axios({
      method: "get",
      url: process.env.REACT_APP_BASE_URL + "message/getUnreadMessageCount",
      headers: {
        "x-auth-token": authToken,
      },
    });

    const data = await res.data;

    dispatch(setUnReadMessages(data));
    return data;
  } catch (error) {
    dispatch(setFailed(error));
  }
};

export const getChatPrice =
  (name: string): AppThunk =>
  async (dispatch) => {
    const authToken = localStorage.getItem("authToken") || "";
    dispatch(setLoading(true));
    try {
      let res = await axios({
        method: "get",
        url: process.env.REACT_APP_BASE_URL + "pricing/getPricingByName",
        params: {
          name,
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

export const updateLastSeenByUser =
  (chatId: string, updateQuery: any): AppThunk =>
  async (dispatch) => {
    try {
      const authToken = localStorage.getItem("authToken") || "";

      const res = await axios({
        method: "post",
        url: `${process.env.REACT_APP_BASE_URL}payment/updateLastSeen`,
        data: {
          chatId,
          updateQuery,
        },
        headers: {
          "x-auth-token": authToken,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.log("🚀 ~ file: messageReducer.ts ~ line 230 ~ err", err);
    }
  };
export const {
  setLoading,
  setFailed,
  setLatestMessage,
  setUserPayment,
  setUnReadMessages,
  setPreviousChat,
} = messageSlice.actions;

export default messageSlice.reducer;
