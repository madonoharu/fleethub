import { nanoid } from "@reduxjs/toolkit"
import { schema, normalize, denormalize, NormalizedSchema } from "normalizr"
import { GearState, ShipState, FleetState, AirbaseState, PlanState } from "@fleethub/core"

import { ShipEntity } from "./ships"
import { GearEntity } from "./gears"
import { FleetEntity } from "./fleets"
import { AirbaseEntity } from "./airbases"
import { PlanEntity } from "./plans"

const gearSchema = new schema.Entity("gears")
const shipSchema = new schema.Entity("ships", {
  gears: [gearSchema],
})
const fleetSchema = new schema.Entity("fleets", {
  ships: [shipSchema],
})
const airbaseSchema = new schema.Entity("airbases", {
  gears: [gearSchema],
})
const planSchema = new schema.Entity("plans", {
  fleets: [fleetSchema],
  airbases: [airbaseSchema],
})

export type NormalizedEntities = {
  gears?: Record<string, GearEntity>
  ships?: Record<string, ShipEntity>
  fleets?: Record<string, FleetEntity>
  airbases?: Record<string, AirbaseEntity>
  plans?: Record<string, PlanEntity>
}

export type FhNormalizedSchema = NormalizedSchema<NormalizedEntities, string>

export const setIdToGear = (state: GearState) => ({ ...state, id: nanoid() })

const setIdToShip = (state: ShipState) => {
  const gears = state.gears?.map((gear) => gear && setIdToGear(gear)) ?? []
  return { ...state, gears, id: nanoid() }
}

const setIdToFleet = (state: FleetState) => {
  const ships = state.ships.map((ship) => ship && setIdToShip(ship))
  return { ...state, ships, id: nanoid() }
}

const setIdToAirbase = (state: AirbaseState) => {
  const gears = state.gears?.map((gear) => gear && setIdToGear(gear)) ?? []
  return { ...state, gears, id: nanoid() }
}

const setIdToPlan = (state: PlanState) => {
  const fleets = state.fleets.map(setIdToFleet)
  const airbases = state.airbases?.map(setIdToAirbase)
  return { ...state, fleets, airbases, id: nanoid() }
}

type GearStateWithId = ReturnType<typeof setIdToGear>
type ShipStateWithId = ReturnType<typeof setIdToShip>
type FleetStateWithId = ReturnType<typeof setIdToFleet>
type AirbaseStateWithId = ReturnType<typeof setIdToAirbase>
type PlanStateWithId = ReturnType<typeof setIdToPlan>

export const normalizeShip = (state: ShipState): FhNormalizedSchema => normalize(setIdToShip(state), shipSchema)

export const denormalizeShip = (entity: ShipEntity, entities: NormalizedEntities): ShipStateWithId =>
  denormalize(entity, shipSchema, entities)

export const normalizeFleet = (state: FleetState): FhNormalizedSchema => normalize(setIdToFleet(state), fleetSchema)

export const denormalizeFleet = (entity: FleetEntity, entities: NormalizedEntities): FleetStateWithId =>
  denormalize(entity, fleetSchema, entities)

export const normalizePlan = (state: PlanState): FhNormalizedSchema => normalize(setIdToPlan(state), planSchema)

export const denormalizePlan = (entity: PlanEntity, entities: NormalizedEntities): PlanStateWithId =>
  denormalize(entity, planSchema, entities)
