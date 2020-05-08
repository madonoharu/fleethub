import { createEntityAdapter, EntityId } from "@reduxjs/toolkit"
import { NullableArray, AirbaseState } from "@fleethub/core"

import { selectId, Entity } from "./entity"

export type AirbaseEntity = Entity & { gears: NullableArray<EntityId> } & Required<Omit<AirbaseState, "gears">>

export const airbasesAdapter = createEntityAdapter<AirbaseEntity>({ selectId })
