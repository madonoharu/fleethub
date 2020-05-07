import { createEntityAdapter, EntityId, EntitySelectors } from "@reduxjs/toolkit"
import { DefaultRootState } from "react-redux"
import { FleetState, ShipState, NullableArray } from "@fleethub/core"

import { GearEntity } from "./gears"
import { normalizeShip, ShipEntity } from "./ships"
import { selectId, Entity, getUid } from "./entity"

export type FleetRole = "main" | "escort"

export type FleetRecord = Partial<Record<FleetRole, NullableArray<ShipState>>>

export type FleetEntity = Entity & { ships: NullableArray<EntityId> } & Required<Omit<FleetState, "ships">>

export type NormalizedFleet = {
  fleet: FleetEntity
  gears: GearEntity[]
  ships: ShipEntity[]
}

export const normalizeFleet = (fleetState: FleetState): NormalizedFleet => {
  const gears: GearEntity[] = []
  const ships: ShipEntity[] = []

  const shipUids = fleetState.ships.map((ship) => {
    if (!ship) return
    const normalized = normalizeShip(ship)
    gears.push(...normalized.gears)
    ships.push(normalized.ship)

    return normalized.ship.uid
  })

  const fleet: FleetEntity = { uid: getUid(), ships: shipUids }

  return { fleet, gears, ships }
}

export const fleetsAdapter = createEntityAdapter<FleetEntity>({ selectId })

export const fleetsSelectors: EntitySelectors<FleetEntity, DefaultRootState> = fleetsAdapter.getSelectors(
  (state) => state.entities.fleets
)
