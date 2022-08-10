import { createSlice } from "@reduxjs/toolkit";

export interface ErrorSuccessMessage {
  message: string;
  isOpen: boolean;
  isSuccess: boolean;
}

export const initialState: ErrorSuccessMessage = {
  message: "",
  isOpen: false,
  isSuccess: false,
};

export const errorMessageReducer = createSlice({
  name: "errorSuccessMessage",
  initialState,
  reducers: {
    setMessage: (state, { payload }) => {
      state.message = payload;
    },
    setIsOpen: (state, { payload }) => {
      state.isOpen = payload;
    },
    setIsSuccess: (state, { payload }) => {
      state.isSuccess = payload;
    },
  },
});
export const { setMessage, setIsOpen, setIsSuccess } =
  errorMessageReducer.actions;

export default errorMessageReducer.reducer;
