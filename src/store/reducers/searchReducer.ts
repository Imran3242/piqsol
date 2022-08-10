import { createSlice } from "@reduxjs/toolkit";

import { AppThunk, RootState } from "../store";

export interface SearchState {
  searchText: String;
  profileSearchText: String;
  searchTextOnFocus: boolean;
  profileSearchTextOnFocus: boolean;
}

export const initialState: SearchState = {
  searchText: undefined,
  profileSearchText: undefined,
  searchTextOnFocus: false,
  profileSearchTextOnFocus: false,
};

export const SearchState = createSlice({
  name: "createActivity",
  initialState,
  reducers: {
    setSearchedText: (state, { payload }) => {
      state.searchText = payload;
    },
    setProfileSearchedText: (state, { payload }) => {
      state.profileSearchText = payload;
    },
    setSearchTextOnFocus: (state, { payload }) => {
      state.searchTextOnFocus = payload;
    },
    setProfileSearchTextOnFocus: (state, { payload }) => {
      state.profileSearchTextOnFocus = payload;
    },
  },
});

export const {
  setSearchedText,
  setProfileSearchedText,
  setSearchTextOnFocus,
  setProfileSearchTextOnFocus,
} = SearchState.actions;

export default SearchState.reducer;
