"use client";

import { createSlice } from "@reduxjs/toolkit";

export const modalSlice = createSlice({
  name: "modalSlice",
  initialState: {
    hasModal: false,
  },
  reducers: {
    setHasModal(state, action) {
      state.hasModal = action.payload;
    },
  },
});

export const { setHasModal } = modalSlice.actions;

export default modalSlice.reducer;
