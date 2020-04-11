import React from "react"
import { useSelector, useDispatch, shallowEqual, DefaultRootState } from "react-redux"
import { EntityId, createSelector } from "@reduxjs/toolkit"
import { fhSystem, GearState, NullableArray } from "@fleethub/core"
import { range } from "lodash-es"

import { isEntityId, createShallowEqualSelector } from "../utils"
import { entitiesSlice, ShipEntity, shipsSelectors, gearsSelectors, gearSelectSlice } from "../store"

import { useWhatChanged } from "@simbathesailor/use-what-changed"

const createFhShipSelector = (id: EntityId) => {
  const getShipEntity = (state: DefaultRootState) => shipsSelectors.selectEntities(state)[id]

  const getGearEntities = (state: DefaultRootState) =>
    getShipEntity(state)?.gears.map((gearId) =>
      isEntityId(gearId) ? gearsSelectors.selectEntities(state)[gearId] : undefined
    )

  const gearEntitiesSelector = createShallowEqualSelector(getGearEntities, (entities) => entities)

  return createSelector(getShipEntity, gearEntitiesSelector, (shipEntity, gearEntities) => {
    if (shipEntity === undefined || gearEntities === undefined) return
    return fhSystem.createShip({ ...shipEntity, gears: gearEntities })
  })
}

export const useShip = (id: EntityId) => {
  const dispatch = useDispatch()
  const actions = React.useMemo(
    () => ({
      update: (changes: Partial<ShipEntity>) => {
        dispatch(entitiesSlice.actions.updateShip({ id, changes }))
      },
      changeSlotSize: (index: number, value: number) => {
        console.log(index, value)
      },
      remove: () => {
        dispatch(entitiesSlice.actions.removeShip(id))
      },

      openGearSelect: (index: number) => {
        const position = { ship: id, index }
        dispatch(gearSelectSlice.actions.set({ position }))
      },
    }),
    [dispatch, id]
  )

  const fhShipSelector = React.useCallback(createFhShipSelector(id), [id])
  const fhShip = useSelector(fhShipSelector)

  const gears = useSelector((state) => {
    const entityGears = shipsSelectors.selectEntities(state)[id]?.gears
    if (!fhShip || !entityGears) return []

    return range(fhShip.equipment.size).map((index) => entityGears[index])
  }, shallowEqual)

  return { actions, gears, fhShip }
}
