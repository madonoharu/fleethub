import { shallowEqual, DefaultRootState } from "react-redux"
import { EntityId } from "@reduxjs/toolkit"
import { NullableArray, isNonNullable, ShipState } from "@fleethub/core"

import { gearsSelectors } from "./gears"
import { shipsSelectors } from "./ships"
import { fleetsSelectors } from "./fleets"

export const shipStateEqual = (left?: ShipState, right?: ShipState) => {
  if (!left || !right) return left === right

  const { gears: leftGears, ...leftRest } = left
  const { gears: rightGears, ...rightRest } = right
  return shallowEqual(leftGears, rightGears) && shallowEqual(leftRest, rightRest)
}

export const fleetStateEqual = (left?: NullableArray<ShipState>, right?: NullableArray<ShipState>) => {
  if (!left || !right) return left === right

  return left.every((ship, index) => shipStateEqual(ship, left[index]))
}

const getGearEntity = (state: DefaultRootState, id: EntityId) => gearsSelectors.selectById(state, id)

const getShipEntity = (state: DefaultRootState, id: EntityId) => shipsSelectors.selectById(state, id)

const getFleetEntity = (state: DefaultRootState, id: EntityId) => fleetsSelectors.selectById(state, id)

export const getShipState = (state: DefaultRootState, id: EntityId) => {
  const entity = getShipEntity(state, id)
  if (!entity) return

  const gears = entity.gears.map((gearId) => (gearId ? getGearEntity(state, gearId) : undefined))
  return { ...entity, gears }
}

export const getFleetState = (state: DefaultRootState, id: EntityId) => {
  const entity = getFleetEntity(state, id)
  if (!entity) return

  const ships = entity.main.map((shipId) => (shipId ? getShipState(state, shipId) : undefined))
  return { ...entity, ships }
}
