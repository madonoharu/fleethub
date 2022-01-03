import { SHIP_KEYS } from "@fh/utils";
import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";

import { ormAdapters, getSliceName } from "./base";

const key = "fleets";
const adapter = ormAdapters[key];
const sliceName = getSliceName(key);

export const fleetsSlice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    add: {
      reducer: adapter.addOne,
      prepare: () => {
        return { payload: { id: nanoid() } };
      },
    },
    update: adapter.updateOne,
    remove: adapter.removeOne,
    removeShips: (state, { payload }: PayloadAction<string>) => {
      const entity = state.entities[payload];

      if (entity) {
        SHIP_KEYS.forEach((key) => {
          delete entity[key];
        });
      }
    },
  },
});
