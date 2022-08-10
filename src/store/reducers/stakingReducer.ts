import { createSlice } from "@reduxjs/toolkit";
import { AppThunk } from "store/store";
import axios from "axios";

export const getListOfStakingByUserId =
  (userId: string, type: string): AppThunk =>
  async (dispatch) => {
    try {
      const authToken = localStorage.getItem("authToken") || "";
      const res = await axios({
        method: "get",
        url: `${process.env.REACT_APP_BASE_URL}staking/listOfStaking/${userId}/${type}`,
        headers: { "x-auth-token": authToken },
      });
      const list = res.data;
      return list?.stakingList;
    } catch (err) {
      console.log("🚀 ~ file: stakingReducer.ts ~ line 10 ~ err", err);
    }
  };

export const addStaking =
  (payload: any): AppThunk =>
  async (dispatch) => {
    try {
      const authToken = localStorage.getItem("authToken") || "";
      const res = await axios({
        method: "post",
        url: `${process.env.REACT_APP_BASE_URL}staking/addStaking`,
        data: { payload },
        headers: {
          "x-auth-token": authToken,
          "Content-Type": "application/json",
        },
      });
      const data = res.data;
      return data;
    } catch (err) {
      console.log(
        "🚀 ~ file: stakingReducer.ts ~ line 26 ~ addStaking ~ err",
        err
      );
    }
  };
