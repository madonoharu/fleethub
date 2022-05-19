import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MasterData } from "fleethub-core";
import { ActionCreators } from "redux-undo";

import { GkcoiTheme } from "../utils";

import { entitiesSlice } from "./entities/entitiesSlice";
import { parseUrl } from "./parseUrl";

type AppState = {
  fileId?: string;
  configOpen?: boolean;
  explorerOpen: boolean;
  importToTemp: boolean;
  gkcoiTheme: GkcoiTheme;
};

const initialState: AppState = {
  explorerOpen: true,
  importToTemp: false,
  gkcoiTheme: "dark",
};

export const appSlice = createSlice({
  name: "app",
  initialState,

  reducers: {
    openHome: (state) => {
      delete state.fileId;
      delete state.configOpen;
    },
    openFile: (state, { payload }: PayloadAction<string>) => {
      state.configOpen = false;
      if (state.fileId !== payload) {
        state.fileId = payload;
      }
    },
    openConfig: (state) => {
      state.configOpen = true;
    },
    toggleExplorerOpen: (state) => {
      state.explorerOpen = !state.explorerOpen;
    },
    setImportToTemp: (state, { payload }: PayloadAction<boolean>) => {
      state.importToTemp = payload;
    },
    setGkcoiTheme: (state, { payload }: PayloadAction<GkcoiTheme>) => {
      state.gkcoiTheme = payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(entitiesSlice.actions.createPlan, (state, { payload }) => {
        state.fileId = payload.input.id;
      })
      .addCase(entitiesSlice.actions.import, (state, { payload }) => {
        state.fileId = payload.result;
      });
  },
});

export const initApp = createAsyncThunk(
  "app/init",
  async (masterData: MasterData, thunkAPI) => {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(location.href);
    window.history.replaceState(null, "", location.pathname);

    const payload = await parseUrl(masterData, url);

    if (payload) {
      thunkAPI.dispatch(entitiesSlice.actions.import(payload));
    }

    thunkAPI.dispatch(ActionCreators.clearHistory());
  }
);
