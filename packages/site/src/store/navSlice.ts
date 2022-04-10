import { AlertColor } from "@mui/material";
import { createSlice, isRejected, PayloadAction } from "@reduxjs/toolkit";

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

  extraReducers: (builder) => {
    builder.addMatcher(isRejected, (state, { error }) => {
      state.alert = {
        severity: "error",
        message: error.code || error.message || error.code || "unknown error",
      };
    });
  },
});
