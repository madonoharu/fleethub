import { createEntityAdapter, EntityId } from "@reduxjs/toolkit"
import { FleetState, ShipState, NullableArray } from "@fleethub/core"

import { selectId, Entity } from "./entity"

export type FleetEntity = Entity & { ships: NullableArray<EntityId> } & Required<Omit<FleetState, "ships">>

export const airbasesAdapter = createEntityAdapter<FleetEntity>({ selectId })
