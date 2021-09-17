import { GearParams } from "@fh/core";
import {
  createAction,
  createSlice,
  nanoid,
  PayloadAction,
} from "@reduxjs/toolkit";
import { GearPosition } from "./gearsSlice";

export type GearSelectState = {
  open: boolean;
  create?: boolean;
  id?: string;
  position?: GearPosition;
};

const initialState: GearSelectState = {
  open: false,
};

const hide = () => initialState;

export const createGear = createAction(
  "entities/createGear",
  (position: GearPosition, state: GearParams) => ({
    payload: { position, gear: { ...state, id: nanoid() } },
  })
);

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

  extraReducers: (builder) => builder.addCase(createGear, hide),
});
