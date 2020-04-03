import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { EntityId } from "@reduxjs/toolkit"
import { ShipState } from "@fleethub/kcsim"

import { entitiesSlice, fleetsSelectors, FleetRole } from "../store"
import { useShipSelect } from "./useShipSelect"

export const useFleet = (id: EntityId) => {
  const dispatch = useDispatch()
  const shipSelect = useShipSelect()
  const entity = useSelector((state) => fleetsSelectors.selectEntities(state)[id])

  const actions = React.useMemo(
    () => ({
      remove: () => {
        dispatch(entitiesSlice.actions.removeFleet(id))
      },
      update: (changes: Partial<{ name: string }>) => {
        dispatch(entitiesSlice.actions.updateFleet({ id, changes }))
      },
      createShip: (role: FleetRole, index: number, ship: ShipState) => {
        dispatch(entitiesSlice.actions.createShip({ fleet: id, role, index, ship }))
      },
    }),
    [dispatch, id]
  )

  const openShipSelect = React.useCallback(
    (role: FleetRole, index: number) => {
      shipSelect.onOpen({ position: { fleet: id, role, index } })
    },
    [id, shipSelect]
  )

  return { entity, actions, openShipSelect }
}
