import { createSlice } from "@reduxjs/toolkit";

import { AppThunk, RootState } from "../store";
import axios from "axios";

export interface ErrorMessage {
  message: string;
}
export interface FavouriteState {
  userFavourties?: Array<any>;
}

export const initialState: FavouriteState = {
  userFavourties: [],
};

export const favouriteSlice = createSlice({
  name: "createFavourite",
  initialState,
  reducers: {
    setUserFavourite: (state, payload) => {
      state.userFavourties = payload.payload;
    },
  },
});

export const updateUserNftFavourtie =
  (favouriteData: any): AppThunk =>
  async (dispatch) => {
    try {
      const authToken = localStorage.getItem("authToken") || "";

      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + `favourite/updateFavourite`,
        headers: {
          "x-auth-token": authToken,
        },
        data: favouriteData,
      });
      let data = await res.data;
      return data;
    } catch (error) {
      console.log("updateUserNftFavourtie error =====", error);
    }
  };

export const getUserFavouriteNft =
  (userId: string): AppThunk =>
  async (dispatch) => {
    try {
      let res = await axios({
        method: "get",
        url:
          process.env.REACT_APP_BASE_URL +
          `favourite/getUserFavourite/${userId}`,
      });
      let data = await res.data;
      dispatch(setUserFavourite(data));
      return data;
    } catch (error) {
      console.log("getUserFavouriteNft error =====", error);
    }
  };

export const { setUserFavourite } = favouriteSlice.actions;

export default favouriteSlice.reducer;
