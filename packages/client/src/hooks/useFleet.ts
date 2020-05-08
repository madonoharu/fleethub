import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { EntityId } from "@reduxjs/toolkit"

import { entitiesSlice, shipSelectSlice, makeGetFleetState, FleetEntity, getFleetEntity } from "../store"

import { useFhSystem } from "./useFhSystem"

export const useFleet = (id: EntityId) => {
  const dispatch = useDispatch()
  const fhSystem = useFhSystem()

  const entity = useSelector((state) => getFleetEntity(state, id))

  const getFleetState = React.useMemo(makeGetFleetState, [id])
  const fleetState = useSelector((state) => getFleetState(state, id))
  const fhFleet = React.useMemo(() => fleetState && fhSystem.createFleet(fleetState), [fhSystem, fleetState])

  const actions = React.useMemo(
    () => ({
      remove: () => {
        dispatch(entitiesSlice.actions.removeFleet(id))
      },
      update: (changes: Partial<FleetEntity>) => {
        dispatch(entitiesSlice.actions.updateFleet({ id, changes }))
      },

      openShipSelect: (index: number) => {
        const target = { fleet: id, index }
        dispatch(shipSelectSlice.actions.set({ target }))
      },
    }),
    [dispatch, id]
  )

  return { entity, actions, fhFleet }
}
