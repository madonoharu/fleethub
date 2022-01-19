import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GearCategory } from "fleethub-core";

import { entitiesSlice, GearPosition } from "./entities/entitiesSlice";

export type GearCategoryFilter = GearCategory | "All";

export type GearSelectState = {
  open: boolean;
  create?: boolean;
  id?: string;
  position?: GearPosition;
  abyssal?: boolean;
  category?: GearCategoryFilter;
};

const initialState: GearSelectState = {
  open: false,
  category: "All",
};

const hide = (state: GearSelectState) => {
  state.open = false;
  delete state.create;
  delete state.id;
  delete state.position;
};

export const gearSelectSlice = createSlice({
  name: "gearSelect",
  initialState,

  reducers: {
    update: (state, { payload }: PayloadAction<Partial<GearSelectState>>) => {
      Object.assign(state, payload);
    },
    create: (state, { payload }: PayloadAction<Partial<GearSelectState>>) => {
      Object.assign(state, payload);
      state.create = true;
      state.open = true;
    },
    show: (state) => {
      state.open = true;
    },
    hide,
  },

  extraReducers: (builder) =>
    builder.addCase(entitiesSlice.actions.createGear, hide),
});
