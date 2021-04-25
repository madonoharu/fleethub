import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type GearListState = {
  group: string;
  abyssal: boolean;
};

const initialState: GearListState = {
  group: "",
  abyssal: false,
};

export const gearListSlice = createSlice({
  name: "gearList",
  initialState,

  reducers: {
    update: (state, { payload }: PayloadAction<Partial<GearListState>>) => {
      Object.assign(state, payload);
    },
  },
});
