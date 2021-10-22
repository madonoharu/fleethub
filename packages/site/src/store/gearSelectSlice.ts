import {
  createAction,
  createSlice,
  nanoid,
  PayloadAction,
} from "@reduxjs/toolkit";
import { GearCategory, GearState } from "fleethub-core";
import { GearPosition } from "./gearsSlice";

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

export const createGear = createAction(
  "entities/createGear",
  (position: GearPosition, state: GearState) => ({
    payload: { position, gear: { ...state, id: nanoid() } },
  })
);

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

  extraReducers: (builder) => builder.addCase(createGear, hide),
});
