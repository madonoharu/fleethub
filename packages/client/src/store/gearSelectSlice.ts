import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { GearPosition } from "./entities"

export type GearSelectState = {
  position?: GearPosition
  filter?: string
  category: number
  abyssal?: boolean
}

const initialState: GearSelectState = {
  category: 0,
}

export default createSlice({
  name: "gearSelect",
  initialState,
  reducers: {
    set: (state, { payload }: PayloadAction<Partial<GearSelectState>>) => {
      Object.assign(state, payload)
    },
  },
})
