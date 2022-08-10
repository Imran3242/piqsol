import { createSlice } from "@reduxjs/toolkit";

import { AppThunk, RootState } from "../store";

export interface FilterState {
  expanded: String[];
  selectedAttributes: Array<any>;
  currentCollection: string;
  minValue: number;
  maxValue: number;
}
export const initialState: FilterState = {
  expanded: ["panel1"],
  selectedAttributes: [],
  currentCollection: undefined,
  minValue: undefined,
  maxValue: undefined,
};

export const FilterState = createSlice({
  name: "filterActivity",
  initialState,
  reducers: {
    setExpanded: (state, { payload }) => {
      state.expanded = payload;
    },
    setMinValue: (state, { payload }) => {
      state.minValue = payload;
    },
    setMaxValue: (state, { payload }) => {
      state.maxValue = payload;
    },
    setSelectedAttributes: (state, { payload }) => {
      state.selectedAttributes = payload;
    },
    setCurrentCollection: (state, { payload }) => {
      state.currentCollection = payload;
    },
  },
});

export const {
  setExpanded,
  setMinValue,
  setMaxValue,
  setSelectedAttributes,
  setCurrentCollection,
} = FilterState.actions;
export default FilterState.reducer;
