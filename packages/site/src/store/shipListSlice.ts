import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ShipListState = {
  all: boolean;
  abyssal: boolean;
  basicFilter: string;
};
const initialState: ShipListState = {
  all: false,
  abyssal: false,
  basicFilter: "Battleship",
};

export const shipListSlice = createSlice({
  name: "shipList",
  initialState,

  reducers: {
    update: (state, { payload }: PayloadAction<Partial<ShipListState>>) => {
      Object.assign(state, payload);
    },
  },
});
