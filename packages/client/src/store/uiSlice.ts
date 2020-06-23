import { createSlice, PayloadAction, EntityId } from "@reduxjs/toolkit"
import { ShipCategory } from "@fleethub/core"

export type ShipListState = {
  abyssal: boolean
  commonly: boolean
  category: ShipCategory
}

type MapListState = {
  mapId: number
  point: string
  difficulty: number
}

type UiState = {
  planId?: EntityId
  shipList: ShipListState
  mapList: MapListState
}

const initialState: UiState = {
  shipList: {
    abyssal: false,
    commonly: true,
    category: "Battleship",
  },
  mapList: {
    mapId: 11,
    point: "A",
    difficulty: 4,
  },
}

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openPlan: (state, { payload }: PayloadAction<EntityId>) => {
      state.planId = payload
    },
    closePlan: (state) => {
      delete state.planId
    },

    updateShipList: (state, { payload }: PayloadAction<Partial<ShipListState>>) => {
      Object.assign(state.shipList, payload)
    },

    updateMap: (state, { payload }: PayloadAction<Partial<MapListState>>) => {
      Object.assign(state.mapList, payload)
    },
  },
})
