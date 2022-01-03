import { AirSquadronKey, FleetKey } from "@fh/utils";
import { createSlice, EntityState, PayloadAction } from "@reduxjs/toolkit";

import { getSliceName, ormAdapters } from "./base";
import { SwapPayload } from "./entitiesSlice";
import { OrgEntity } from "./schemata";

const key = "orgs";
const adapter = ormAdapters[key];
const sliceName = getSliceName(key);

export type FleetPosition = {
  org: string;
  key: FleetKey;
};
export type AirSquadronPosition = {
  org: string;
  key: AirSquadronKey;
};

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
  payload: SwapPayload<FleetPosition | AirSquadronPosition>
) => {
  const { drag, drop } = payload;
  const dragId = state.entities[drag.org]?.[drag.key];
  const dropId = state.entities[drop.org]?.[drop.key];
  setChildId(state, drag, dropId);
  setChildId(state, drop, dragId);
};

export const orgsSlice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    set: (state, { payload }: PayloadAction<OrgEntity>) => {
      state.entities[payload.id] = payload;
    },

    swapFleet: (
      state,
      { payload }: PayloadAction<SwapPayload<FleetPosition>>
    ) => {
      swapPosition(state, payload);
    },

    swapAirSquadron: (
      state,
      { payload }: PayloadAction<SwapPayload<AirSquadronPosition>>
    ) => {
      swapPosition(state, payload);
    },

    update: adapter.updateOne,
  },
});
