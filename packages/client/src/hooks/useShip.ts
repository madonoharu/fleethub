import React from "react"
import { useSelector, useDispatch, shallowEqual, DefaultRootState } from "react-redux"
import { EntityId, createSelector } from "@reduxjs/toolkit"
import { fhSystem, GearState } from "@fleethub/core"
import { range } from "lodash-es"

import { isEntityId, createShallowEqualSelector } from "../utils"
import { entitiesSlice, ShipEntity, shipsSelectors, gearsSelectors } from "../store"

import { useGearSelect } from "./useGearSelect"

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
      createGear: (index: number, gear: GearState) => {
        const position = { ship: id, index }
        dispatch(entitiesSlice.actions.createGear({ ...position, gear }))
      },
      update: (changes: Partial<ShipEntity>) => {
        dispatch(entitiesSlice.actions.updateShip({ id, changes }))
      },
      changeSlotSize: (index: number, value: number) => {
        console.log(index, value)
      },
      remove: () => {
        dispatch(entitiesSlice.actions.removeShip(id))
      },
    }),
    [dispatch, id]
  )

  const onSelectOpen = useGearSelect().onOpen
  const openGearSelect = React.useCallback(
    (index: number) => {
      onSelectOpen({ position: { ship: id, index } })
    },
    [id, onSelectOpen]
  )

  const fhShipSelector = React.useCallback(createFhShipSelector(id), [id])
  const fhShip = useSelector(fhShipSelector)

  const entity = useSelector((state) => shipsSelectors.selectEntities(state)[id])

  const gears = range((fhShip?.equipment.initialSlots.length ?? 0) + 1).map((index) => entity?.gears[index])

  return { actions, openGearSelect, gears, fhShip }
}
