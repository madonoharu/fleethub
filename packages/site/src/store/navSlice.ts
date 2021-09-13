import { AlertColor } from "@mui/material";
import { createSlice, isRejected, PayloadAction } from "@reduxjs/toolkit";

import { publishFile } from "./entities";

type AlertState = {
  severity: AlertColor;
  message: string;
};

type NavState = {
  alert?: AlertState;
  pending?: boolean;
  shareUrl?: string;
};

const initialState: NavState = {};

export const navSlice = createSlice({
  name: "nav",
  initialState,

  reducers: {
    setAlert: (state, { payload }: PayloadAction<AlertState>) => {
      state.alert = payload;
    },
    setPending: (state, { payload }: PayloadAction<boolean>) => {
      state.pending = payload;
    },
  },

  extraReducers: (bapplder) => {
    bapplder
      .addCase(publishFile.fulfilled, (state, { payload }) => {
        state.alert = {
          severity: "success",
          message: "共有URLをコピーしました",
        };

        state.shareUrl = payload;
      })
      .addMatcher(isRejected, (state, { error }) => {
        state.alert = {
          severity: "error",
          message: error.code || error.message || error.code || "unknown error",
        };
      })
      .addMatcher(
        (action) =>
          typeof action.type === "string" &&
          !action.type.startsWith(publishFile.typePrefix) &&
          action.type.startsWith("entities"),
        (state) => {
          delete state.shareUrl;
        }
      );
  },
});
