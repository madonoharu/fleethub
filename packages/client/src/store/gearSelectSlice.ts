import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { GearPosition } from "./entities"

export type GearSelectState = {
  position?: GearPosition
}

const initialState: GearSelectState = {}

export default createSlice({
  name: "shipSelect",
  initialState,
  reducers: {
    set: (state, { payload }: PayloadAction<GearSelectState>) => {
      Object.assign(state, payload)
    },
  },
})
