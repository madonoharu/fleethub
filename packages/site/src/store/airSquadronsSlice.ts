import { createSlice, EntityState } from "@reduxjs/toolkit";
import { airSquadronsAdapter } from "./adapters";
import { isEntitiesAction, swapGearPosition, sweep } from "./entities";
import { createGear } from "./gearSelectSlice";
import { GearPosition } from "./gearsSlice";
import { AirSquadronEntity } from "./schema";

const setGearId = (
  state: EntityState<AirSquadronEntity>,
  position: GearPosition,
  id: string | undefined
) => {
  if (position.tag !== "airSquadron") return;
  const entity = state.entities[position.id];

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

      .addCase(createGear, (state, { payload }) => {
        setGearId(state, payload.position, payload.gear.id);
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
