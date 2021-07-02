import { AppThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { filesSlice } from "./filesSlice";
import { orgsSelectors } from "./orgsSlice";
import { ignoreUndoable } from "./undoableOptions";

type AppState = {
  fileId?: string;
  explorerOpen: boolean;
  importToTemp: boolean;
};

const initialState: AppState = {
  explorerOpen: true,
  importToTemp: false,
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
  },

  extraReducers: (bapplder) => {
    bapplder
      .addCase(filesSlice.actions.createPlan, (state, { payload }) => {
        state.fileId = payload.org.id;
      })
      .addCase(filesSlice.actions.add, (state, { payload }) => {
        state.fileId = payload.data.id;
      });
  },
});

export const openDefaultFile = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const orgIds = orgsSelectors.selectIds(state);

  ignoreUndoable(() => {
    if (orgIds.length) {
      dispatch(appSlice.actions.openFile(orgIds[orgIds.length - 1] as string));
    } else {
      dispatch(filesSlice.actions.createPlan({ to: "root" }));
    }
  });
};
