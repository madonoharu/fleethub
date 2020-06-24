import { createSlice, PayloadAction, EntityId } from "@reduxjs/toolkit"
import { ShipCategory } from "@fleethub/core"

export type GearListState = {
  filterKey: string
  category: number
  abyssal: boolean
}

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
  gearList: GearListState
  shipList: ShipListState
  mapList: MapListState
}

const initialState: UiState = {
  gearList: {
    filterKey: "",
    category: 0,
    abyssal: false,
  },
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

    updateGearList: (state, { payload }: PayloadAction<Partial<GearListState>>) => {
      Object.assign(state.gearList, payload)
    },

    updateShipList: (state, { payload }: PayloadAction<Partial<ShipListState>>) => {
      Object.assign(state.shipList, payload)
    },

    updateMap: (state, { payload }: PayloadAction<Partial<MapListState>>) => {
      Object.assign(state.mapList, payload)
    },
  },
})
