import {
  AppThunk,
  createSlice,
  isAnyOf,
  PayloadAction,
} from "@reduxjs/toolkit";
import { GkcoiTheme } from "../utils";

import { createPlan, importEntities } from "./entities";
import { ignoreUndoable } from "./undoableOptions";

type AppState = {
  fileId?: string;
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
    openFile: (state, { payload }: PayloadAction<string>) => {
      if (state.fileId !== payload) state.fileId = payload;
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

  extraReducers: (bapplder) => {
    bapplder.addMatcher(
      isAnyOf(createPlan, importEntities),
      (state, { payload }) => {
        state.fileId = payload.fileId;
      }
    );
  },
});

export const openDefaultFile = (): AppThunk => (dispatch, getState) => {
  const root = getState();
  const rootIds = root.present.files.rootIds;

  ignoreUndoable(() => {
    if (rootIds.length) {
      dispatch(appSlice.actions.openFile(rootIds[rootIds.length - 1]));
    }
  });
};
