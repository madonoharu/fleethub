import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { ShipCategory } from "@fleethub/core"

export type ShipListState = {
  abyssal: boolean
  commonly: boolean
  category: ShipCategory
}
const initialState: ShipListState = {
  abyssal: false,
  commonly: true,
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
