import { AirSquadronKey, FleetKey } from "@fh/utils";
import { createSlice, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { SwapEvent } from "../hooks";

import { orgsAdapter } from "./adapters";
import { isEntitiesAction, sweep } from "./entities";
import { OrgEntity } from "./schema";

export type FleetPosition = { org: string; key: FleetKey };
export type AirSquadronPosition = { org: string; key: AirSquadronKey };

const setChildId = (
  state: EntityState<OrgEntity>,
  position: FleetPosition | AirSquadronPosition,
  id: string | undefined
) => {
  const entity = state.entities[position.org];

  if (entity) {
    entity[position.key] = id;
  }
};

const swapPosition = (
  state: EntityState<OrgEntity>,
  payload: SwapEvent<FleetPosition | AirSquadronPosition>
) => {
  const { drag, drop } = payload;
  const dragId = state.entities[drag.org]?.[drag.key];
  const dropId = state.entities[drop.org]?.[drop.key];
  setChildId(state, drag, dropId);
  setChildId(state, drop, dragId);
};

export const orgsSlice = createSlice({
  name: "entities/orgs",
  initialState: orgsAdapter.getInitialState(),
  reducers: {
    set: (state, { payload }: PayloadAction<OrgEntity>) => {
      state.entities[payload.id] = payload;
    },

    swapFleet: (
      state,
      { payload }: PayloadAction<SwapEvent<FleetPosition>>
    ) => {
      swapPosition(state, payload);
    },

    swapAirSquadron: (
      state,
      { payload }: PayloadAction<SwapEvent<AirSquadronPosition>>
    ) => {
      swapPosition(state, payload);
    },

    update: orgsAdapter.updateOne,
  },

  extraReducers: (builder) => {
    builder
      .addCase(sweep, (state, { payload }) => {
        orgsAdapter.removeMany(state, payload.orgs);
      })
      .addMatcher(isEntitiesAction, (state, { payload }) => {
        if (payload.entities.orgs) {
          orgsAdapter.addMany(state, payload.entities.orgs);
        }
      });
  },
});
