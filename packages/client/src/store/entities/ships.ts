import { createEntityAdapter, EntityId } from "@reduxjs/toolkit"
import { ShipState, NullableArray } from "@fleethub/core"

import { Entity, selectId } from "./entity"

export type GearIndex = number

export type ShipEntity = Entity &
  Omit<ShipState, "gears"> & {
    gears: NullableArray<EntityId>
  }

export const shipsAdapter = createEntityAdapter<ShipEntity>({ selectId })
