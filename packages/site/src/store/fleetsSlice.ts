import { Dict, GearKey, Role, ShipKey, SlotSizeKey } from "@fleethub/utils";
import {
  createEntityAdapter,
  createSlice,
  EntityId,
  nanoid,
} from "@reduxjs/toolkit";
import { snakeCase } from "literal-case";
import { DefaultRootState } from "react-redux";

import { filesSlice } from "./filesSlice";
import { getPresentState } from "./selectors";
import { shipsSlice } from "./shipsSlice";

export type FleetEntity = {
  id: EntityId;
} & Dict<ShipKey, EntityId>;

const adapter = createEntityAdapter<FleetEntity>();

export const fleetsSelectors = adapter.getSelectors(
  (root: DefaultRootState) => getPresentState(root).fleets
);

export const fleetsSlice = createSlice({
  name: "fleets",
  initialState: adapter.getInitialState(),
  reducers: {
    add: {
      reducer: adapter.addOne,
      prepare: () => {
        return { payload: { id: nanoid() } };
      },
    },
    remove: adapter.removeOne,
  },

  extraReducers: (builder) => {
    builder
      .addCase(shipsSlice.actions.add, (state, { payload, meta }) => {
        const position = meta.fleet;
        const entity = position && state.entities[position.id];
        if (!position || !entity) return;

        entity[position.key] = payload.id;
      })
      .addCase(filesSlice.actions.createPlan, (state, { payload, meta }) => {
        adapter.addMany(state, [
          { id: meta.main },
          { id: meta.escort },
          { id: meta.route_sup },
          { id: meta.boss_sup },
        ]);
      });
  },
});
