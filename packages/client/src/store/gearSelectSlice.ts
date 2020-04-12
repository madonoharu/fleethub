import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { GearPosition } from "./entities"

export type GearSelectState = {
  target?: GearPosition
  filter: string
  category: number
  abyssal: boolean
}

const initialState: GearSelectState = {
  filter: "all",
  category: 0,
  abyssal: false,
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
