import { createSlice, EntityState } from "@reduxjs/toolkit";

import { airSquadronsAdapter } from "./adapters";
import { isEntitiesAction, swapGearPosition, sweep } from "./entities";
import { GearPosition, gearsSlice } from "./gearsSlice";
import { AirSquadronEntity } from "./schema";

const setGearId = (
  state: EntityState<AirSquadronEntity>,
  position: GearPosition,
  id: string | undefined
) => {
  if (!("airSquadron" in position)) return;
  const entity = state.entities[position.airSquadron];

  if (entity) {
    entity[position.key] = id;
  }
};

export const airSquadronsSlice = createSlice({
  name: "entities/airSquadrons",
  initialState: airSquadronsAdapter.getInitialState(),
  reducers: {
    update: airSquadronsAdapter.updateOne,
  },
  extraReducers: (builder) => {
    builder

      .addCase(gearsSlice.actions.add, (state, { payload, meta }) => {
        const { position } = meta;
        setGearId(state, position, payload.id);
      })
      .addCase(swapGearPosition, (state, { payload }) => {
        const { drag, drop } = payload;

        setGearId(state, drag.position, drop.id);
        setGearId(state, drop.position, drag.id);
      })
      .addCase(sweep, (state, { payload }) => {
        airSquadronsAdapter.removeMany(state, payload.airSquadrons);
      })
      .addMatcher(isEntitiesAction, (state, { payload }) => {
        const { airSquadrons } = payload.entities;
        if (airSquadrons) airSquadronsAdapter.addMany(state, airSquadrons);
      });
  },
});
