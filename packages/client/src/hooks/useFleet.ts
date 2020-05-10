import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { EntityId } from "@reduxjs/toolkit"

import { entitiesSlice, makeGetFleetState, FleetEntity, getFleetEntity } from "../store"

import { useFhSystem } from "./useFhSystem"
import { ShipState } from "@fleethub/core"
import { useShipSelectActions } from "./useShipSelectContext"

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
      createShip: (index: number, ship: ShipState) => {
        dispatch(entitiesSlice.actions.createShip({ to: { fleet: id, index }, ship }))
      },
    }),
    [dispatch, id]
  )

  const shipSelectActions = useShipSelectActions()
  const openShipSelect = React.useCallback(
    (index: number) => {
      shipSelectActions.open((ship) => actions.createShip(index, ship))
    },
    [shipSelectActions, actions]
  )

  return { entity, actions, fhFleet, openShipSelect }
}
