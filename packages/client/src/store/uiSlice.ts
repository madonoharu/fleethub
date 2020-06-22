import { createSlice, PayloadAction, EntityId } from "@reduxjs/toolkit"

type UiMapState = {
  mapId: number
  point: string
  difficulty: number
}

type UiState = {
  planId?: EntityId
  map: UiMapState
}

const initialState: UiState = {
  map: {
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
    updateMap: (state, { payload }: PayloadAction<Partial<UiMapState>>) => {
      Object.assign(state.map, payload)
    },
  },
})
