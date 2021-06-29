import { GearKey, GearState } from "@fleethub/utils";
import {
  createEntityAdapter,
  createSlice,
  EntityId,
  EntitySelectors,
  nanoid,
} from "@reduxjs/toolkit";
import { DefaultRootState } from "react-redux";

import { selectGearsState } from "./selectors";

export type GearPosition =
  | { ship: EntityId; key: GearKey }
  | { airSquadron: EntityId; key: GearKey };

type GearEntity = {
  id: EntityId;
} & GearState;

const adapter = createEntityAdapter<GearEntity>();
export const gearsSelectors: EntitySelectors<GearEntity, DefaultRootState> =
  adapter.getSelectors(selectGearsState);

export const gearsSlice = createSlice({
  name: "gears",
  initialState: adapter.getInitialState(),
  reducers: {
    add: {
      reducer: adapter.addOne,
      prepare: (position: GearPosition, state: GearState) => ({
        payload: { ...state, id: nanoid() },
        meta: { position },
      }),
    },
    update: adapter.updateOne,
    remove: adapter.removeOne,
  },
});
