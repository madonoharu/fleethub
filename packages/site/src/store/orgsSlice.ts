import { FleetKey } from "@fh/utils";
import { createSlice, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { SwapEvent } from "../hooks";

import { orgsAdapter } from "./adapters";
import { isEntitiesAction, sweep } from "./entities";
import { OrgEntity } from "./schema";

type FleetPosition = { org: string; key: FleetKey };

const setFleetId = (
  state: EntityState<OrgEntity>,
  position: FleetPosition,
  id: string | undefined
) => {
  const entity = state.entities[position.org];

  if (entity) {
    entity[position.key] = id;
  }
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
      const { drag, drop } = payload;
      const dragId = state.entities[drag.org]?.[drag.key];
      const dropId = state.entities[drop.org]?.[drop.key];
      setFleetId(state, drag, dropId);
      setFleetId(state, drop, dragId);
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
