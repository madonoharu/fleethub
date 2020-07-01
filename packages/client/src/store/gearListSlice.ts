import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export type GearListState = {
  filterKey: string
  category: number
  abyssal: boolean
}

const initialState: GearListState = {
  filterKey: "",
  category: 0,
  abyssal: false,
}

export const gearListSlice = createSlice({
  name: "gearList",
  initialState,

  reducers: {
    update: (state, { payload }: PayloadAction<Partial<GearListState>>) => {
      Object.assign(state, payload)
    },
  },
})
