import { createSlice, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { airSquadronsAdapter } from "./adapters";
import { equip, isEntitiesAction, swapGearPosition, sweep } from "./entities";
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
    reset: (state, { payload }: PayloadAction<string[]>) => {
      airSquadronsAdapter.setMany(
        state,
        payload.map((id) => ({ id }))
      );
    },
    resetSlotSize: (state, { payload }: PayloadAction<string[]>) => {
      const changes = {
        ss1: undefined,
        ss2: undefined,
        ss3: undefined,
        ss4: undefined,
        ss5: undefined,
      };

      airSquadronsAdapter.updateMany(
        state,
        payload.map((id) => ({ id, changes }))
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(equip, (state, { payload }) => {
        if (payload.tag === "airSquadron") {
          airSquadronsAdapter.updateOne(state, payload);
        }
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
