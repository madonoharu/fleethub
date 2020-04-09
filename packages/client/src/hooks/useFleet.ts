import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { EntityId } from "@reduxjs/toolkit"

import { entitiesSlice, shipSelectSlice, fleetsSelectors, FleetRole } from "../store"

export const useFleet = (id: EntityId) => {
  const dispatch = useDispatch()
  const entity = useSelector((state) => fleetsSelectors.selectEntities(state)[id])

  const actions = React.useMemo(
    () => ({
      remove: () => {
        dispatch(entitiesSlice.actions.removeFleet(id))
      },
      update: (changes: Partial<{ name: string }>) => {
        dispatch(entitiesSlice.actions.updateFleet({ id, changes }))
      },

      openShipSelect: (role: FleetRole, index: number) => {
        const position = { fleet: id, role, index }
        dispatch(shipSelectSlice.actions.set({ position }))
      },
    }),
    [dispatch, id]
  )

  return { entity, actions }
}
