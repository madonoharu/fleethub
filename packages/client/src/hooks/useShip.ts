import React from "react"
import { useSelector, useDispatch, shallowEqual } from "react-redux"
import { EntityId } from "@reduxjs/toolkit"
import { kcsim, GearState } from "@fleethub/kcsim"
import { range } from "lodash-es"

import { entitiesSlice, ShipEntity } from "../store"
import { shipsSelectors, gearsSelectors } from "../store/entities"

import { useGearSelect } from "./useGearSelect"

const isEntityId = (id: unknown): id is EntityId => {
  switch (typeof id) {
    case "string":
    case "number":
      return true
  }
  return false
}

const useKcsimShip = (entity?: ShipEntity) =>
  useSelector((state) => {
    if (!entity) return
  })

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

  const entity = useSelector((state) => shipsSelectors.selectEntities(state)[id])
  const gearEntities = useSelector((state) => {
    const gears = entity?.gears.map((gearId) =>
      isEntityId(gearId) ? gearsSelectors.selectEntities(state)[gearId] : undefined
    )
    return gears
  }, shallowEqual)

  const kcShip = React.useMemo(() => {
    if (!entity || !gearEntities) return

    return kcsim.createShip({ ...entity, gears: gearEntities })
  }, [entity, gearEntities])

  const gears = range((kcShip?.equipment.initialSlots.length ?? 0) + 1).map((index) => entity?.gears[index])

  return { entity, actions, openGearSelect, gears, kcShip }
}
