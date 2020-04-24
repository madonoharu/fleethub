import { createEntityAdapter, EntityId, EntitySelectors } from "@reduxjs/toolkit"
import { DefaultRootState } from "react-redux"
import { ShipState, NullableArray } from "@fleethub/core"

import { GearEntity } from "./gears"
import { normalizeShip, ShipEntity } from "./ships"
import { selectId, Entity, getUid } from "./entity"

export type FleetRole = "main" | "escort"

export type FleetRecord = Partial<Record<FleetRole, NullableArray<ShipState>>>
export type FleetState = FleetRecord & {
  name?: string
}

export type FleetEntity = Entity & Record<FleetRole, NullableArray<EntityId>> & Required<Omit<FleetState, FleetRole>>

export type NormalizedFleet = {
  fleet: FleetEntity
  gears: GearEntity[]
  ships: ShipEntity[]
}

export const normalizeFleet = (fleetState: FleetState): NormalizedFleet => {
  const gears: GearEntity[] = []
  const ships: ShipEntity[] = []

  const shipsToIds = (shipStates: NullableArray<ShipState>) =>
    shipStates.map((ship) => {
      if (!ship) return
      const normalized = normalizeShip(ship)
      gears.push(...normalized.gears)
      ships.push(normalized.ship)

      return normalized.ship.uid
    })

  const main = shipsToIds(fleetState.main ?? [])
  const escort = shipsToIds(fleetState.escort ?? [])

  const fleet = { name: "", uid: getUid(), main, escort }

  return { fleet, gears, ships }
}

export const fleetsAdapter = createEntityAdapter<FleetEntity>({ selectId })

export const fleetsSelectors: EntitySelectors<FleetEntity, DefaultRootState> = fleetsAdapter.getSelectors(
  (state) => state.entities.fleets
)
