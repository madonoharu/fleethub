import React from "react"
import { useSelector, useDispatch, shallowEqual } from "react-redux"
import { EntityId } from "@reduxjs/toolkit"
import { range } from "lodash-es"
import { GearState } from "@fleethub/core"

import { entitiesSlice, ShipEntity, getShipEntity } from "../store"
import { useFhShip } from "./useFhShip"
import { useGearSelectActions } from "./useGearSelectContext"

export const useShip = (id: EntityId) => {
  const dispatch = useDispatch()
  const fhShip = useFhShip(id)

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

      createGear: (index: number, gear: GearState) => {
        dispatch(entitiesSlice.actions.createGear({ to: { type: "ship", id, index }, gear }))
      },
    }),
    [dispatch, id]
  )

  const gearSelectActions = useGearSelectActions()
  const openGearSelect = (index: number) => {
    if (!fhShip) return
    gearSelectActions.update({
      onSelect: (gear) => {
        actions.createGear(index, gear)
        gearSelectActions.close()
      },
      canEquip: (gear) => fhShip.canEquip(index, gear),
      getBonuses: fhShip.makeGetNextBonuses(index),
    })
  }

  const gears = useSelector((state) => {
    const entityGears = getShipEntity(state, id)?.gears
    if (!fhShip || !entityGears) return []

    return range(fhShip.equipment.size).map((index) => entityGears[index])
  }, shallowEqual)

  return { actions, gears, fhShip, openGearSelect }
}
