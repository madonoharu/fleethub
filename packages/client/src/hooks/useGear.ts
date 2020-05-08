import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { EntityId } from "@reduxjs/toolkit"
import { GearState, fhSystem } from "@fleethub/core"

import { entitiesSlice, getGearEntity } from "../store"

export const useGear = (id: EntityId) => {
  const dispatch = useDispatch()

  const actions = React.useMemo(
    () => ({
      remove: () => {
        dispatch(entitiesSlice.actions.removeGear(id))
      },
      update: (changes: Partial<GearState>) => {
        dispatch(entitiesSlice.actions.updateGear({ id, changes }))
      },
    }),
    [dispatch, id]
  )

  const entity = useSelector((state) => getGearEntity(state, id))
  const fhGear = React.useMemo(() => entity && fhSystem.createGear(entity), [entity])

  return { fhGear, actions }
}
