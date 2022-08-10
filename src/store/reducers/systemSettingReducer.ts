import { createSlice } from "@reduxjs/toolkit";

import { AppThunk, RootState } from "../store";
import axios from "axios";

export interface ErrorMessage {
  message: string;
}
export interface SystemSettingState {
  systemSettings?: Array<any>;
}

export const initialState: SystemSettingState = {
  systemSettings: [],
};

export const systemSettingSlice = createSlice({
  name: "createSystemSetting",
  initialState,
  reducers: {
    setSystemSetting: (state, payload) => {
      state.systemSettings = payload.payload;
    },
  },
});

export const getSystemSettings =
(): AppThunk =>
async (dispatch) => {
try {
    let res = await axios({
    method: "get",
    url:
        process.env.REACT_APP_BASE_URL + `systemSetting/getAllSystemSetting`,
    });
    let data = await res.data;
    dispatch(setSystemSetting(data))
    return data;
} catch (error) {
    console.log("getSystemSetting error =====", error);
}
};


export const { setSystemSetting } = systemSettingSlice.actions;

export default systemSettingSlice.reducer;


