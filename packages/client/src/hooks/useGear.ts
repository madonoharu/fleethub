import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { EntityId } from "@reduxjs/toolkit"

import { entitiesSlice, gearsSelectors, GearState } from "../store"

export const useGear = (uid: EntityId) => {
  const dispatch = useDispatch()
  const entity = useSelector((state) => gearsSelectors.selectEntities(state)[uid])

  const actions = React.useMemo(
    () => ({
      remove: () => {
        dispatch(entitiesSlice.actions.removeGear(uid))
      },
      update: (changes: Partial<GearState>) => {
        dispatch(entitiesSlice.actions.updateGear({ id: uid, changes }))
      },
    }),
    [dispatch, uid]
  )

  return { entity, actions }
}
