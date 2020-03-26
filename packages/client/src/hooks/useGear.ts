import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { EntityId } from "@reduxjs/toolkit"
import { GearState, kcsimFactory } from "@fleethub/kcsim"

import { entitiesSlice, gearsSelectors } from "../store"

export const useGear = (uid: EntityId) => {
  const dispatch = useDispatch()

  const kcGear = useSelector((state) => {
    const entity = gearsSelectors.selectEntities(state)[uid]
    return entity && kcsimFactory.createGear(entity)
  })

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

  return { kcGear, actions }
}
