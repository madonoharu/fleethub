import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type GkcoiState = {
  theme: any;
  lang: any;
};

const initialState: GkcoiState = {
  theme: "dark",
  lang: "jp",
};

export const gkcoiSlice = createSlice({
  name: "gkcoi",
  initialState,

  reducers: {
    setTheme: (state, { payload }: PayloadAction<any>) => {
      state.theme = payload;
    },
    setLang: (state, { payload }: PayloadAction<any>) => {
      state.lang = payload;
    },
  },
});
