import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { EntityId } from "@reduxjs/toolkit"
import { GearState, kcsim } from "@fleethub/core"

import { entitiesSlice, gearsSelectors } from "../store"

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

  const entity = useSelector((state) => gearsSelectors.selectEntities(state)[id])
  const kcGear = React.useMemo(() => entity && kcsim.createGear(entity), [entity])

  return { kcGear, actions }
}
