import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import { GkcoiTheme, GkcoiLang } from "../utils"

export type GkcoiState = {
  theme: GkcoiTheme
  lang: GkcoiLang
}

const initialState: GkcoiState = {
  theme: "dark",
  lang: "jp",
}

export const gkcoiSlice = createSlice({
  name: "gkcoi",
  initialState,

  reducers: {
    setTheme: (state, { payload }: PayloadAction<GkcoiTheme>) => {
      state.theme = payload
    },
    setLang: (state, { payload }: PayloadAction<GkcoiLang>) => {
      state.lang = payload
    },
  },
})
