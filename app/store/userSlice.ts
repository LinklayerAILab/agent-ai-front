"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { user_rewardpoints } from "../api/user";

// Async action: sync points
export const syncPoints = createAsyncThunk(
  'user/syncPoints',
  async (_, { rejectWithValue }) => {
    try {
      const response = await user_rewardpoints();
      return response.data.reward_points;
    } catch {
      return rejectWithValue('Failed to sync points');
    }
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState: {
    address: "",
    access_token: "",
    isLogin: false,
    points: 0,
    pointsLoading: false,
    otherInfo:{
      web3_address: "",
      email: "",
      invite_code: "",
      invite_count: 0,
      image: ''
    }
  },
  reducers: {
    initializeFromLocalStorage: (state) => {
      // Only execute initialization on client side
      state.address = localStorage.getItem("address") || "";
      state.access_token = localStorage.getItem("access_token") || "";
      state.isLogin = localStorage.getItem("access_token") ? true : false;
      state.otherInfo = JSON.parse(localStorage.getItem("otherInfo") || "{}");
    },
    setUserInfo(state, action) {
      window.localStorage.setItem("access_token", action.payload.access_token);
      window.localStorage.setItem("address", action.payload.address);


      state.access_token = action.payload.access_token;
      state.address = action.payload.address;

      state.isLogin = true;
    },
    setOtherInfo(state, action) {
      state.otherInfo = action.payload;
      localStorage.setItem("otherInfo", JSON.stringify(action.payload));
    },

    setPoints(state, action) {
      state.points = action.payload;
    },
    logout(state) {
      window.localStorage.removeItem("access_token");
      window.localStorage.removeItem("otherInfo");
      window.localStorage.removeItem("invite_code");
      window.localStorage.removeItem("address");
      state.access_token = "";
      state.address = "";
      state.isLogin = false;
      state.points = 0;
      state.pointsLoading = false;
      state.otherInfo = {
       web3_address: "",
      email: "",
      invite_code: "",
      invite_count: 0,
      image: ''
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncPoints.pending, (state) => {
        state.pointsLoading = true;
      })
      .addCase(syncPoints.fulfilled, (state, action) => {
        state.pointsLoading = false;
        state.points = action.payload;
      })
      .addCase(syncPoints.rejected, (state) => {
        state.pointsLoading = false;
      });
  },
});

export const { setUserInfo, logout, setPoints, initializeFromLocalStorage,setOtherInfo } =
  userSlice.actions;

export default userSlice.reducer;
