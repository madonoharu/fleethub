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

export type GearPosition = { id: EntityId; key: GearKey };

type GearEntity = {
  id: EntityId;
} & GearState;

type AddGearPayload = GearEntity & {
  ship: EntityId;
};

const adapter = createEntityAdapter<GearEntity>();
export const gearsSelectors: EntitySelectors<
  GearEntity,
  DefaultRootState
> = adapter.getSelectors(selectGearsState);

export const gearsSlice = createSlice({
  name: "gears",
  initialState: adapter.getInitialState(),
  reducers: {
    add: {
      reducer: adapter.addOne,
      prepare: (state: GearState, to: { ship?: GearPosition }) => ({
        payload: { ...state, id: nanoid() },
        meta: to,
      }),
    },
    update: adapter.updateOne,
    remove: adapter.removeOne,
  },
});
