import { createSlice, PayloadAction, EntityId } from "@reduxjs/toolkit"

type MapListState = {
  mapId: number
  point: string
  difficulty: number
}

type UiState = {
  planId?: EntityId
  mapList: MapListState
}

const initialState: UiState = {
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

    updateMap: (state, { payload }: PayloadAction<Partial<MapListState>>) => {
      Object.assign(state.mapList, payload)
    },
  },
})
