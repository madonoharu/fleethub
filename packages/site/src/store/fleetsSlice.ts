import { AirbaseKey, Dict, Role, ShipKey } from "@fleethub/utils";
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
} & Record<Role, Dict<ShipKey, EntityId>> &
  Record<AirbaseKey, EntityId>;

const adapter = createEntityAdapter<FleetEntity>();

const selectors = adapter.getSelectors(
  (root: DefaultRootState) => getPresentState(root).fleets
);

export const selectFleet = (root: DefaultRootState, id: EntityId) =>
  selectors.selectById(root, id);

export const fleetsSlice = createSlice({
  name: "fleets",
  initialState: adapter.getInitialState(),
  reducers: {
    add: {
      reducer: adapter.addOne,
      prepare: () => {
        return {
          payload: {
            id: nanoid(),
            main: {},
            escort: {},
            route_sup: {},
            boss_sup: {},
            a1: {},
            a2: {},
            a3: {},
          },
        };
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

        entity[snakeCase(position.role)][position.key] = payload.id;
      })
      .addCase(filesSlice.actions.createPlan, (state, { payload }) => {
        adapter.addOne(state, {
          id: payload.plan.id,
          main: {},
          escort: {},
          route_sup: {},
          boss_sup: {},
          a1: {},
          a2: {},
          a3: {},
        });
      });
  },
});
