import { nanoid } from "@reduxjs/toolkit"
import { schema, normalize, denormalize } from "normalizr"
import { GearState, ShipState, NullableArray, FleetState } from "@fleethub/core"

import { ShipEntity } from "./ships"
import { GearEntity } from "./gears"
import { FleetEntity } from "./fleets"
import { PlanEntity } from "./plans"

export type PlanState = {
  name: string
  fleets: FleetState[]
}

const gearSchema = new schema.Entity("gears")
const shipSchema = new schema.Entity("ships", {
  gears: [gearSchema],
})
const fleetSchema = new schema.Entity("fleets", {
  ships: [shipSchema],
})
const planSchema = new schema.Entity("plans", {
  fleets: [fleetSchema],
})

export type NormalizedEntities = {
  gears?: Record<string, GearEntity>
  ships?: Record<string, ShipEntity>
  fleets?: Record<string, FleetEntity>
  plans?: Record<string, PlanEntity>
}

const setIdToGear = (state: GearState) => ({ ...state, id: nanoid() })

const setIdToShip = (state: ShipState) => {
  const gears = state.gears?.map((gear) => gear && setIdToGear(gear))
  return { ...state, gears, id: nanoid() }
}

const setIdToFleet = (state: FleetState) => {
  const ships = state.ships.map((ship) => ship && setIdToShip(ship))
  return { ...state, ships, id: nanoid() }
}

const setIdToPlan = (state: PlanState) => {
  const fleets = state.fleets.map(setIdToFleet)
  return { ...state, fleets }
}

type GearStateWithId = ReturnType<typeof setIdToGear>
type ShipStateWithId = ReturnType<typeof setIdToShip>
type FleetStateWithId = ReturnType<typeof setIdToFleet>
type PlanStateWithId = ReturnType<typeof setIdToPlan>

export const normalizeShip = (state: ShipState): NormalizedEntities =>
  normalize(setIdToShip(state), shipSchema).entities
export const denormalizeShip = (entity: ShipEntity, entities: NormalizedEntities): ShipStateWithId =>
  denormalize(entity, shipSchema, entities)

export const normalizeFleet = (state: FleetState): NormalizedEntities =>
  normalize(setIdToFleet(state), fleetSchema).entities
export const denormalizeFleet = (entity: FleetEntity, entities: NormalizedEntities): FleetStateWithId =>
  denormalize(entity, fleetSchema, entities)

export const normalizePlan = (state: PlanState): NormalizedEntities =>
  normalize(setIdToPlan(state), planSchema).entities
export const denormalizePlan = (entity: PlanEntity, entities: NormalizedEntities): PlanStateWithId =>
  denormalize(entity, planSchema, entities)
