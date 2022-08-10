import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./reducers/authReducer";
import collectionReducer from "./reducers/collectionReducer";
import nftReducer from "./reducers/nftReducer";
import userReducer from "./reducers/userReducer";
import messageReducer from "./reducers/messageReducer";
import activityReducer from "./reducers/activityReducer";
import blogReducer from "./reducers/blogReducer";
import favouriteReducer from "./reducers/favouriteReducer";
import searchReducer from "./reducers/searchReducer";
import filterReducer from "./reducers/filterReducer";
import systemSettingReducer from "./reducers/systemSettingReducer";
import attributeReducer from "./reducers/attributeReducer";
import errorSuccessMessageReducer from "./reducers/errorSuccessMessageReducer";

const rootReducer = combineReducers({
  authReducer,
  collectionReducer,
  nftReducer,
  userReducer,
  messageReducer,
  activityReducer,
  blogReducer,
  favouriteReducer,
  searchReducer,
  systemSettingReducer,
  attributeReducer,
  filterReducer,
  errorSuccessMessageReducer,
});

// export type RootState = ReturnType;

export default rootReducer;
