import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export type MapListState = {
  mapId: number
  point: string
  difficulty: number
}

const initialState: MapListState = {
  mapId: 11,
  point: "A",
  difficulty: 4,
}

export const mapListSlice = createSlice({
  name: "mapList",
  initialState,

  reducers: {
    update: (state, { payload }: PayloadAction<Partial<MapListState>>) => {
      Object.assign(state, payload)
    },
  },
})
