import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { EntityId } from "@reduxjs/toolkit"

import { entitiesSlice, shipSelectSlice, fleetsSelectors, FleetRole, makeGetFleetState } from "../store"

import { useFhSystem } from "./useFhSystem"

export const useFleet = (id: EntityId) => {
  const dispatch = useDispatch()
  const fhSystem = useFhSystem()

  const entity = useSelector((state) => fleetsSelectors.selectEntities(state)[id])

  const getFleetState = React.useMemo(makeGetFleetState, [id])

  const fleetState = useSelector((state) => getFleetState(state, id))

  const fhFleet = fleetState && fhSystem.createFleet(fleetState)

  const actions = React.useMemo(
    () => ({
      remove: () => {
        dispatch(entitiesSlice.actions.removeFleet(id))
      },
      update: (changes: Partial<{ name: string }>) => {
        dispatch(entitiesSlice.actions.updateFleet({ id, changes }))
      },

      openShipSelect: (role: FleetRole, index: number) => {
        const target = { fleet: id, role, index }
        dispatch(shipSelectSlice.actions.set({ target }))
      },
    }),
    [dispatch, id]
  )

  return { entity, actions, fhFleet }
}
