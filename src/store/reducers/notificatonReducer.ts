import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { AppThunk, RootState } from "../store";
export interface MessageError {
  message: string;
}

export const getUserUnSeenNotification = (): AppThunk => async (dispatch) => {
  const authToken = localStorage.getItem("authToken") || "";
  try {
    let res = await axios({
      method: "get",
      url:
        process.env.REACT_APP_BASE_URL +
        "notification/getUserUnseenNotification",
      headers: {
        "x-auth-token": authToken,
      },
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log("getUserUnSeenNotification error", error);
    return []
  }
};

export const getUserAllNotification = (): AppThunk => async (dispatch) => {
  const authToken = localStorage.getItem("authToken") || "";
  try {
    let res = await axios({
      method: "get",
      url: process.env.REACT_APP_BASE_URL + "notification/getUserNotification",
      headers: {
        "x-auth-token": authToken,
      },
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log("getUserUnSeenNotification error", error);
    return []
  }
};

export const updateNotification =
  (notificationId: string, notificationData: any): AppThunk =>
  async (dispatch) => {
    const authToken = localStorage.getItem("authToken") || "";
    try {
      let res = await axios({
        method: "post",
        url:
          process.env.REACT_APP_BASE_URL +
          `notification/updateNotification/${notificationId}`,
        data: notificationData,
        headers: {
          "x-auth-token": authToken,
        },
      });
      const data = res.data;
      return data;
    } catch (error) {
      console.log("getUserUnSeenNotification error", error);
    }
  };
