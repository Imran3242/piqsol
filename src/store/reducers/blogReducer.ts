import { createSlice } from "@reduxjs/toolkit";

import { AppThunk, RootState } from "../store";
import axios from "axios";
import { useDispatch , useSelector } from "react-redux";

export interface ErrorMessage {
  message: string;
}
export interface blog {
  _id: String;
  heading: String;
  description: String;
  image: String;
  read : String;
  date : Date;
}
export interface BlogState {
  blogs?: blog[];
  isLoading: boolean;
  error: ErrorMessage;
}

export const initialState: BlogState = {
  isLoading: false,
  error: { message: "An Error occurred" },
};

export const blogSlice = createSlice({
  name: "createBlog",
  initialState,
  reducers: {
    setLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
    setBlog: (state, payload) => {
      state.blogs = payload.payload;
    },
    setFailed: (state, { payload }) => {
      state.error = payload;
    },
  },
});

export const getBlogs = (page : number = 0 , limit : number = 3): AppThunk => async (dispatch) => {
  const authToken = localStorage.getItem("authToken") || "";
  dispatch(setLoading(true));
  try {
    let res = await axios({
      method: "get",
      url: process.env.REACT_APP_BASE_URL + `blog/getAll?page=${page}&limit=${limit}`,
      headers: {
        "x-auth-token": authToken,
      },
    });

    const data = res.data;
    dispatch(setBlog(data));
  } catch (error) {
    dispatch(setFailed(error));
  } finally {
    dispatch(setLoading(false));
  }
};

export const getBlogsCollectionCount = (): AppThunk => async (dispatch) => {
  const authToken = localStorage.getItem("authToken") || "";
  dispatch(setLoading(true));
  try {
    let res = await axios({
      method: "get",
      url: process.env.REACT_APP_BASE_URL + "blog/getCollectionCount",
      headers: {
        "x-auth-token": authToken,
      },
    });

    const data = res.data;
    return data;
  } catch (error) {
    dispatch(setFailed(error));
  } finally {
    dispatch(setLoading(false));
  }
};

export const getBlogDetails =
  (blogId): AppThunk =>
  async (dispatch) => {
    const authToken = localStorage.getItem("authToken") || "";
    dispatch(setLoading(true));
    try {
      let res = await axios({
        method: "get",
        url: process.env.REACT_APP_BASE_URL + `blog/getBlogDetails/${blogId}`,
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

export const getNftDetails =
  (id: string): AppThunk =>
  async (dispatch) => {
    const authToken = localStorage.getItem("authToken") || "";
    dispatch(setLoading(true));
    try {
      let res = await axios({
        method: "get",
        url: process.env.REACT_APP_BASE_URL + "nft/getNftDetail",
        params: {
          id,
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

export const storeMyCollected = (): AppThunk => async (dispatch) => {
  const authToken = localStorage.getItem("authToken") || "";
  dispatch(setLoading(true));
  try {
    let res = await axios({
      method: "get",
      url: process.env.REACT_APP_BASE_URL + "nft/storeAllNftData",
      headers: {
        "x-auth-token": authToken,
      },
    });
    let data = res.data;
  } catch (error) {
    dispatch(setFailed(error));
  } finally {
    dispatch(setLoading(false));
  }
};

export const { setLoading, setFailed, setBlog } = blogSlice.actions;

export default blogSlice.reducer;
