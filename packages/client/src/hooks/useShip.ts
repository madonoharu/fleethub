import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { EntityId } from "@reduxjs/toolkit"

import { entitiesSlice } from "../store"
import { shipsSelectors, GearState } from "../store/entities"

import { useGearSelect } from "./useGearSelect"

export const useShip = (id: EntityId) => {
  const dispatch = useDispatch()
  const entity = useSelector((state) => shipsSelectors.selectEntities(state)[id])
  const gearSelect = useGearSelect()

  const actions = React.useMemo(
    () => ({
      createGear: (index: number, gear: GearState) => {
        dispatch(entitiesSlice.actions.createGear({ ship: id, index, gear }))
      },
      remove: () => {
        dispatch(entitiesSlice.actions.removeShip(id))
      },
    }),
    [dispatch, id]
  )

  const openGearSelect = React.useCallback(
    (index: number) => {
      gearSelect.open({ position: { ship: id, index } })
    },
    [gearSelect]
  )

  const slots = [0, 0, 0, 0]
  const gears = slots.map((s, index) => entity?.gears[index])

  return { entity, actions, openGearSelect, gears }
}
