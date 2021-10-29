import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type MapSelectState = {
  open?: boolean;
  create?: boolean;
  multiple?: boolean;
  mapId: number;
  point: string;
  diff: number;
};

const initialState: MapSelectState = {
  mapId: 11,
  point: "A",
  diff: 4,
};

export const mapSelectSlice = createSlice({
  name: "mapSelect",
  initialState,

  reducers: {
    update: (state, { payload }: PayloadAction<Partial<MapSelectState>>) => {
      Object.assign(state, payload);
    },
    show: (
      state,
      payload: PayloadAction<Partial<MapSelectState> | undefined>
    ) => {
      if (payload) {
        Object.assign(state, payload);
      }
      state.open = true;
    },
    hide: (state) => {
      state.open = false;
    },
  },
});
