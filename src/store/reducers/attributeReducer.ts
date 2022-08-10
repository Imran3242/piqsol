import { createSlice } from "@reduxjs/toolkit";

import { AppThunk, RootState } from "../store";
import axios from "axios";

export interface ErrorMessage {
  message: string;
}
export interface attributeState {
  attributes?: Array<any>;
}

export const initialState: attributeState = {
  attributes: [],
};

export const attributeSlice = createSlice({
  name: "createAttribute",
  initialState,
  reducers: {
    setAttribute: (state, payload) => {
      state.attributes = payload.payload;
    },
  },
});

export const getAttributes =
  (collectionId): AppThunk =>
  async (dispatch) => {
    try {
      let res = await axios({
        method: "get",
        url: `${process.env.REACT_APP_BASE_URL}nft/attributesByCollectionId/${collectionId}`,
      });
      let data = await res.data;
      // dispatch(setAttribute(data));
      return data;
    } catch (error) {
      console.log("getAttributes error =====", error);
    }
  };

export const { setAttribute } = attributeSlice.actions;

export default attributeSlice.reducer;
