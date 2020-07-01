import { createSlice, PayloadAction, AppThunk } from "@reduxjs/toolkit"
import { ShipCategory } from "@fleethub/core"

import { filesSlice } from "./filesSlice"
import { plansSelectors } from "./plansSlice"

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
  planId?: string
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
    openPlan: (state, { payload }: PayloadAction<string>) => {
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

  extraReducers: (builder) => {
    builder
      .addCase(filesSlice.actions.createPlan, (state, { payload }) => {
        state.planId = payload.plan.id
      })
      .addCase(filesSlice.actions.import, (state, { payload: { plans, entry } }) => {
        if (plans?.length === 0) return
        state.planId = entry
      })
  },
})

export const openFirstPlan = (): AppThunk => (dispatch, getState) => {
  const state = getState()
  const planIds = plansSelectors.selectIds(state)

  if (planIds.length) {
    dispatch(uiSlice.actions.openPlan(planIds[planIds.length - 1] as string))
  } else {
    dispatch(filesSlice.actions.createPlan({}))
  }
}
