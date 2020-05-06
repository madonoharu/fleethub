import { useSelector, useDispatch, DefaultRootState } from "react-redux"
import { EntityId, createSelector } from "@reduxjs/toolkit"

import { gearsSelectors } from "./gears"
import { shipsSelectors } from "./ships"
import { fleetsSelectors } from "./fleets"
import { NullableArray } from "@fleethub/core"
import { createShallowEqualSelector } from "../../utils"

const getGearEntity = (state: DefaultRootState, id: EntityId) => gearsSelectors.selectById(state, id)

const getShipEntity = (state: DefaultRootState, id: EntityId) => shipsSelectors.selectById(state, id)

const getFleetEntity = (state: DefaultRootState, id: EntityId) => fleetsSelectors.selectById(state, id)

const makeGetGearStates = () =>
  createShallowEqualSelector(
    (state: DefaultRootState, ids: NullableArray<EntityId>) =>
      ids.map((id) => (id ? getGearEntity(state, id) : undefined)),
    (gears) => gears
  )

export const makeGetShipState = () => {
  const getGearStates = makeGetGearStates()

  return createSelector(
    getShipEntity,
    (state, id) => {
      const entity = getShipEntity(state, id)
      return entity && getGearStates(state, entity.gears)
    },
    (entity, gears) => entity && gears && { ...entity, gears }
  )
}

const makeGetShipStates = () => {
  const getShipState = makeGetShipState()

  return createShallowEqualSelector(
    (state: DefaultRootState, ids: NullableArray<EntityId>) =>
      ids.map((id) => (id ? getShipState(state, id) : undefined)),
    (ships) => ships
  )
}

export const makeGetFleetState = () => {
  const getShipStates = makeGetShipStates()

  return createSelector(
    getFleetEntity,
    (state: DefaultRootState, id: EntityId) => {
      const fleetEntity = getFleetEntity(state, id)
      if (!fleetEntity) return
      return getShipStates(state, fleetEntity.main)
    },
    (entity, ships) => ships
  )
}
