import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { ShipPosition } from "./entities"

export type ShipSelectState = {
  position?: ShipPosition
}

const initialState: ShipSelectState = {}

export default createSlice({
  name: "shipSelect",
  initialState,
  reducers: {
    set: (state, { payload }: PayloadAction<ShipSelectState>) => {
      Object.assign(state, payload)
    },
  },
})
