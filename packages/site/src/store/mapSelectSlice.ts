import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { entitiesSlice } from "./entities/entitiesSlice";

export type MapSelectState = {
  open: boolean;
  mapId: number;
  point: string;
  diff: number;
  createStep?: boolean;
  position?: string;
  multiple?: boolean;
};

const initialState: MapSelectState = {
  open: false,
  mapId: 11,
  point: "A",
  diff: 4,
};

const hide = ({ mapId, point, diff }: MapSelectState) => ({
  open: false,
  mapId,
  point,
  diff,
});

export const mapSelectSlice = createSlice({
  name: "mapSelect",
  initialState,

  reducers: {
    update: (state, { payload }: PayloadAction<Partial<MapSelectState>>) => {
      Object.assign(state, payload);
    },
    show: (
      state,
      { payload }: PayloadAction<Partial<MapSelectState> | undefined>
    ) => {
      if (payload) {
        Object.assign(state, payload);
      }
      state.open = true;
    },
    hide,
  },

  extraReducers: (builder) => {
    builder.addCase(entitiesSlice.actions.addPlanEnemy, (state) => {
      if (!state.multiple) {
        return hide(state);
      }
      return;
    });
  },
});
