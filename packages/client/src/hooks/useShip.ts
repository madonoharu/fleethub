import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { EntityId } from "@reduxjs/toolkit"
import { kcsimFactory, GearState } from "@fleethub/kcsim"

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

  const gearSelect = useGearSelect()
  const openGearSelect = React.useCallback(
    (index: number) => {
      gearSelect.open({ position: { ship: id, index } })
    },
    [gearSelect]
  )

  const entity = useSelector((state) => shipsSelectors.selectEntities(state)[id])

  const kcShip = useSelector((state) => {
    if (!entity) return

    const gears = entity.gears.map((gearId) =>
      isEntityId(gearId) ? gearsSelectors.selectEntities(state)[gearId] : undefined
    )

    return kcsimFactory.createShip({ ...entity, gears })
  })

  const gears = [...Array((kcShip?.equipment.initialSlots.length ?? 0) + 1)].map((_, index) => entity?.gears[index])

  return { entity, actions, openGearSelect, gears, kcShip }
}
