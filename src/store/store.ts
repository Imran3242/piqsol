import { configureStore, Action } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { ThunkAction } from "redux-thunk";
import logger from "redux-logger";

import rootReducer from "./rootReducer";

const configState = {
  reducer: rootReducer,
};

if (process.env.REACT_APP_NETWORK == "devnet") {
  configState['middleware'] = (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger);
}

const store = configureStore(configState);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch();
export type AppThunk = ThunkAction<void, RootState, unknown, Action>;

export default store;
