"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  get_asset_with_logo,
  GetAssetWithLogoItem,
  contract_expert_score,
  spot_expert_score,
} from "../api/agent_c";
import { CEX_NAME } from "../components/Home/PlatformList";

// Sync assets
export const getSyncAssets = createAsyncThunk(
  "user/syncAssets",
  async (cex_name: string, { rejectWithValue }) => {
    try {
      const response = await get_asset_with_logo({ cex_name });
      return response.data.assets || [];
    } catch {
      return rejectWithValue("Failed to sync assets");
    }
  }
);

// Fetch contract expert score
export const getContractExpertScore = createAsyncThunk(
  "assets/getContractExpertScore",
  async (cex_name: string, { rejectWithValue }) => {
    try {
      const response = await contract_expert_score({ cex_name });
      return response.data;
    } catch  {
      return rejectWithValue("Failed to get contract expert score");
    }
  }
);

// Fetch spot expert score
export const getSpotExpertScore = createAsyncThunk(
  "assets/getSpotExpertScore",
  async (cex_name: string, { rejectWithValue }) => {
    try {
      const response = await spot_expert_score({ cex_name });
      return response.data;
    } catch  {
      return rejectWithValue("Failed to get spot expert score");
    }
  }
);
export const assetsSlice = createSlice({
  name: "assetsSlice",
  initialState: {
    loading: false,
    assets: [] as GetAssetWithLogoItem[],
    selectCex: "binance" as CEX_NAME,
    longScore: 0,
    contractExpertScoreLoading: false,
    shortScore: 0,
    spotScore: 0,
    spotExpertScoreLoading: false,
  },
  reducers: {
    setAssets(state, action) {
      state.assets = action.payload;
    },
    setSelectCex(state, action) {
      state.selectCex = action.payload;
    },
    setLongScore(state,action) {
      state.longScore = action.payload
    },
    setShortScore(state,action) {
      state.shortScore = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Sync assets
      .addCase(getSyncAssets.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSyncAssets.fulfilled, (state, action) => {
        state.loading = false;
        // Sort assets by free field in descending order
        const sortedAssets = [...action.payload].sort((a, b) => {
          const freeA = parseFloat(a.free) || 0;
          const freeB = parseFloat(b.free) || 0;
          return freeB - freeA; // Descending order
        });
        state.assets = sortedAssets;
      })
      .addCase(getSyncAssets.rejected, (state) => {
        state.loading = false;
      })
      // Contract expert score
      .addCase(getContractExpertScore.pending, (state) => {
        state.contractExpertScoreLoading = true;
      })
      .addCase(getContractExpertScore.fulfilled, (state, action) => {
        
        state.longScore = action.payload?.long_score || 0;
        state.shortScore = action.payload?.short_score || 0;
      })
      .addCase(getContractExpertScore.rejected, (state) => {
        state.contractExpertScoreLoading = false;
      })
      // Spot expert score
      .addCase(getSpotExpertScore.pending, (state) => {
        state.spotExpertScoreLoading = true;
      })
      .addCase(getSpotExpertScore.fulfilled, (state, action) => {
        state.spotExpertScoreLoading = false;
        state.spotScore = action.payload.score;
      })
      .addCase(getSpotExpertScore.rejected, (state) => {
        state.spotExpertScoreLoading = false;
      });
  },
});

export const { setAssets, setSelectCex,setShortScore,setLongScore } = assetsSlice.actions;

export default assetsSlice.reducer;
