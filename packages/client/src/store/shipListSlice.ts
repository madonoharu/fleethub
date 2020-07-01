import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { ShipCategory } from "@fleethub/core"

export type ShipListState = {
  all: boolean
  abyssal: boolean

  category: ShipCategory
}
const initialState: ShipListState = {
  all: false,
  abyssal: false,
  category: "Battleship",
}

export const shipListSlice = createSlice({
  name: "shipList",
  initialState,

  reducers: {
    update: (state, { payload }: PayloadAction<Partial<ShipListState>>) => {
      Object.assign(state, payload)
    },
  },
})
