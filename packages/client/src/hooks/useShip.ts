import React from "react"
import { useSelector, useDispatch, shallowEqual } from "react-redux"
import { EntityId } from "@reduxjs/toolkit"
import { range } from "lodash-es"

import { entitiesSlice, ShipEntity, getShipEntity, gearSelectSlice } from "../store"
import { useFhShip } from "./useFhShip"

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
        const target = { ship: id, index }
        dispatch(gearSelectSlice.actions.set({ target }))
      },
    }),
    [dispatch, id]
  )

  const fhShip = useFhShip(id)

  const gears = useSelector((state) => {
    const entityGears = getShipEntity(state, id)?.gears
    if (!fhShip || !entityGears) return []

    return range(fhShip.equipment.size).map((index) => entityGears[index])
  }, shallowEqual)

  return { actions, gears, fhShip }
}
