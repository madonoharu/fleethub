import { DefaultRootState } from "react-redux"
import { NullableArray } from "@fleethub/core"

import { createShallowEqualSelector } from "../../utils"

import { gearsAdapter } from "./gears"
import { shipsAdapter } from "./ships"
import { fleetsAdapter } from "./fleets"
import { plansAdapter } from "./plans"

import { Entity } from "./entity"
import { denormalizeShip, denormalizeFleet } from "./schemas"
import { Entities as EntitiesState } from "."
import { EntityId } from "@reduxjs/toolkit"

export const gearsSelectors = gearsAdapter.getSelectors(({ gears }: EntitiesState) => gears)
export const shipsSelectors = shipsAdapter.getSelectors(({ ships }: EntitiesState) => ships)
export const fleetsSelectors = fleetsAdapter.getSelectors(({ fleets }: EntitiesState) => fleets)
export const plansSelectors = plansAdapter.getSelectors(({ plans }: EntitiesState) => plans)

export const getGearEntity = (state: DefaultRootState, id: EntityId) => gearsSelectors.selectById(state.entities, id)
export const getShipEntity = (state: DefaultRootState, id: EntityId) => shipsSelectors.selectById(state.entities, id)
export const getFleetEntity = (state: DefaultRootState, id: EntityId) => fleetsSelectors.selectById(state.entities, id)

const createEntitiesSelectorCreator = <T extends Entity>(
  selectEntity: (state: DefaultRootState, id: EntityId) => T | undefined
) => () =>
  createShallowEqualSelector(
    (state: DefaultRootState, ids: NullableArray<EntityId>) => {
      const entities: Record<string, T> = {}

      for (const id of ids) {
        const entity = id && selectEntity(state, id)
        if (entity) entities[entity.id] = entity
      }

      return entities
    },
    (entities) => entities
  )

const makeGetGearEntities = createEntitiesSelectorCreator(getGearEntity)
const makeGetShipEntities = createEntitiesSelectorCreator(getShipEntity)

export const makeGetShipState = () => {
  const getGearEntities = makeGetGearEntities()

  return createShallowEqualSelector(
    (state: DefaultRootState, id: EntityId) => {
      const entity = getShipEntity(state, id)
      if (!entity) return

      const gearEntities = getGearEntities(state, entity.gears)

      return [entity, gearEntities] as const
    },
    (args) => args && denormalizeShip(args[0], { gears: args[1] })
  )
}

export const makeGetFleetState = () => {
  const getGearEntities = makeGetGearEntities()
  const getShipEntities = makeGetShipEntities()

  return createShallowEqualSelector(
    (state: DefaultRootState, id: EntityId) => {
      const entity = getFleetEntity(state, id)
      if (!entity) return

      const shipEntities = getShipEntities(state, entity.ships)
      const gearEntities = getGearEntities(
        state,
        Object.values(shipEntities).flatMap(({ gears }) => gears)
      )

      return [entity, gearEntities, shipEntities] as const
    },
    (args) => args && denormalizeFleet(args[0], { gears: args[1], ships: args[2] })
  )
}
