import { shallowEqual, DefaultRootState } from "react-redux"
import { EntityId, createSelector, Dictionary } from "@reduxjs/toolkit"
import { NullableArray, isNonNullable, ShipState } from "@fleethub/core"

import { gearsSelectors, GearEntity } from "./gears"
import { shipsSelectors, ShipEntity } from "./ships"
import { fleetsSelectors, FleetEntity } from "./fleets"

import { createShallowEqualSelector } from "../../utils"

const getGearEntity = (state: DefaultRootState, id: EntityId) => gearsSelectors.selectById(state, id)

const getShipEntity = (state: DefaultRootState, id: EntityId) => shipsSelectors.selectById(state, id)

const getFleetEntity = (state: DefaultRootState, id: EntityId) => fleetsSelectors.selectById(state, id)

const makeGetGearEntities = () =>
  createShallowEqualSelector(
    (state: DefaultRootState, ids: NullableArray<EntityId>) => {
      const entities: Dictionary<GearEntity> = {}
      for (const id of ids) {
        if (id) entities[id] = getGearEntity(state, id)
      }
      return entities
    },
    (entities) => entities
  )

const makeGetShipEntities = () =>
  createShallowEqualSelector(
    (state: DefaultRootState, ids: NullableArray<EntityId>) =>
      ids.map((id) => (id ? getShipEntity(state, id) : undefined)).filter(isNonNullable),
    (entities) => entities
  )

const denormalizeShip = (entity: ShipEntity, gearEntities: Dictionary<GearEntity>) => {
  const gears = entity.gears.map((id) => (id ? gearEntities[id] : undefined))
  return { ...entity, gears }
}

const denormalizeFleet = (entity: FleetEntity, shipEntities: ShipEntity[], gearEntities: Dictionary<GearEntity>) => {
  const shipIds = entity.main

  const ships = shipIds
    .map((shipId) => shipEntities.find(({ uid }) => shipId === uid))
    .map((shipEntity) => shipEntity && denormalizeShip(shipEntity, gearEntities))

  return ships
}

export const makeGetShipState = () => {
  const getGearEntities = makeGetGearEntities()

  return createShallowEqualSelector(
    (state: DefaultRootState, id: EntityId) => {
      const entity = getShipEntity(state, id)
      if (!entity) return

      const gearEntities = getGearEntities(state, entity.gears)

      return [entity, gearEntities] as const
    },
    (args) => args && denormalizeShip(...args)
  )
}

export const makeGetFleetState = () => {
  const getGearEntities = makeGetGearEntities()
  const getShipEntities = makeGetShipEntities()

  return createShallowEqualSelector(
    (state: DefaultRootState, id: EntityId) => {
      const entity = getFleetEntity(state, id)
      if (!entity) return

      const shipIds = entity.main

      const shipEntities = getShipEntities(state, shipIds)
      const gearEntities = getGearEntities(
        state,
        shipEntities.flatMap(({ gears }) => gears)
      )

      return [entity, shipEntities, gearEntities] as const
    },
    (args) => args && denormalizeFleet(...args)
  )
}
