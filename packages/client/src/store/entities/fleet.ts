import { createEntityAdapter, EntityId, EntitySelectors } from "@reduxjs/toolkit"
import { GearEntity } from "./gear"
import { getUid, NullableArray } from "../../utils"
import { ShipState, normalizeShip, ShipEntity } from "./ship"

export type FleetRole = "main" | "escort"

export type FleetRecord = Partial<Record<FleetRole, NullableArray<ShipState>>>
export type FleetState = FleetRecord

type FleetEntity = {
  uid: EntityId
} & Record<FleetRole, NullableArray<EntityId>>

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

  const fleet = { uid: getUid(), main, escort }

  return { fleet, gears, ships }
}

export const fleetsAdapter = createEntityAdapter<FleetEntity>({
  selectId: (entity) => entity.uid,
})

export const fleetsSelectors: EntitySelectors<FleetEntity> = fleetsAdapter.getSelectors(
  (state) => state.entities.fleets
)
