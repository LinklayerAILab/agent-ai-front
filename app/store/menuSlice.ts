"use client";

import { createSlice } from "@reduxjs/toolkit";

export const menuSlice = createSlice({
  name: "menuSlice",
  initialState: {
    showMenu: false,
  },
  reducers: {
    setShowMenu(state, action) {
      state.showMenu = action.payload;
    },
  },
});

export const { setShowMenu } = menuSlice.actions;

export default menuSlice.reducer;
