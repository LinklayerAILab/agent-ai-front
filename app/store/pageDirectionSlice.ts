"use client";
import { createSlice } from "@reduxjs/toolkit";

export const pageDirectionSlice = createSlice({
  name: "pageDirection",
  initialState: {
    direction: "scroll-top",
  },
  reducers: {
    setDirection(state, action) {
      state.direction = action.payload;
    },
  },
});

export const { setDirection } = pageDirectionSlice.actions;

export default pageDirectionSlice.reducer;
