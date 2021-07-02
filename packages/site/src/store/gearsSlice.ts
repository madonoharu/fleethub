import { GearParams } from "@fleethub/core";
import { GearKey } from "@fleethub/utils";
import {
  createEntityAdapter,
  createSlice,
  EntitySelectors,
  nanoid,
} from "@reduxjs/toolkit";
import { DefaultRootState } from "react-redux";

import { selectGearsState } from "./selectors";

export type GearPosition =
  | { ship: string; key: GearKey }
  | { airSquadron: string; key: GearKey };

export type GearEntity = {
  id: string;
} & GearParams;

const adapter = createEntityAdapter<GearEntity>();
export const gearsSelectors: EntitySelectors<GearEntity, DefaultRootState> =
  adapter.getSelectors(selectGearsState);

export const gearsSlice = createSlice({
  name: "gears",
  initialState: adapter.getInitialState(),
  reducers: {
    add: {
      reducer: adapter.addOne,
      prepare: (position: GearPosition, state: GearParams) => ({
        payload: { ...state, id: nanoid() },
        meta: { position },
      }),
    },
    update: adapter.updateOne,
    remove: adapter.removeOne,
  },
});
