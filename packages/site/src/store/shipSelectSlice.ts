import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createShip, ShipPosition } from "./entities";

export type ShipSelectState = {
  open: boolean;
  create?: boolean;
  id?: string;
  position?: ShipPosition;
  reselect?: boolean;
  abyssal?: boolean;
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
    hide,
  },

  extraReducers: (builder) => builder.addCase(createShip, hide),
});
