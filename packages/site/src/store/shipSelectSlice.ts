import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ShipCategory } from "fleethub-core";

import { entitiesSlice, ShipPosition } from "./entities/entitiesSlice";

export type ShipSelectState = {
  open: boolean;
  create?: boolean;
  id?: string;
  position?: ShipPosition;
  reselect?: boolean;
  abyssal?: boolean;
  visibleAllForms?: boolean;
  category?: ShipCategory;
};

const initialState: ShipSelectState = {
  open: false,
};

const hide = () => initialState;

export const shipSelectSlice = createSlice({
  name: "shipSelect",
  initialState,

  reducers: {
    update: (state, { payload }: PayloadAction<Partial<ShipSelectState>>) => {
      Object.assign(state, payload);
    },
    create: (state, { payload }: PayloadAction<Partial<ShipSelectState>>) => {
      Object.assign(state, payload);
      state.create = true;
      state.open = true;
    },
    show: (state) => {
      state.open = true;
    },
    hide: ({ visibleAllForms, category }) => {
      return {
        open: false,
        visibleAllForms,
        category,
      };
    },
  },

  extraReducers: (builder) =>
    builder.addCase(entitiesSlice.actions.createShip, hide),
});
