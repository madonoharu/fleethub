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
    updateMap: (state, { payload }: PayloadAction<Partial<UiMapState>>) => {
      Object.assign(state.map, payload)
    },
  },
})
