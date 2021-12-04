import { SHIP_KEYS } from "@fh/utils";
import {
  createSlice,
  EntityState,
  nanoid,
  PayloadAction,
} from "@reduxjs/toolkit";

import { fleetsAdapter } from "./adapters";
import {
  createShip,
  isEntitiesAction,
  ShipPosition,
  swapShip,
  sweep,
} from "./entities";
import { FleetEntity } from "./schema";

const setShipId = (
  state: EntityState<FleetEntity>,
  position: ShipPosition,
  id: string | undefined
) => {
  if (position.tag !== "fleet") return;

  const entity = state.entities[position.id];

  if (entity) {
    entity[position.key] = id;
  }
};

export const fleetsSlice = createSlice({
  name: "entities/fleets",
  initialState: fleetsAdapter.getInitialState(),
  reducers: {
    add: {
      reducer: fleetsAdapter.addOne,
      prepare: () => {
        return { payload: { id: nanoid() } };
      },
    },
    update: fleetsAdapter.updateOne,
    remove: fleetsAdapter.removeOne,
    removeShips: (state, { payload }: PayloadAction<string>) => {
      const entity = state.entities[payload];

      if (entity) {
        SHIP_KEYS.forEach((key) => {
          delete entity[key];
        });
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(createShip, (state, { payload }) => {
        const { position } = payload;
        if (position?.tag !== "fleet") return;

        const entity = state.entities[position.id];

        if (!entity) return;

        entity[position.key] = payload.id;
      })
      .addCase(swapShip, (state, { payload }) => {
        const { drag, drop } = payload;

        setShipId(state, drag.position, drop.id);
        setShipId(state, drop.position, drag.id);
      })
      .addCase(sweep, (state, { payload }) => {
        fleetsAdapter.removeMany(state, payload.fleets);
      })
      .addMatcher(isEntitiesAction, (state, { payload }) => {
        const { fleets } = payload.entities;
        if (fleets) fleetsAdapter.addMany(state, fleets);
      });
  },
});
