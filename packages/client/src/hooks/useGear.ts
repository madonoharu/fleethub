import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { EntityId } from "@reduxjs/toolkit"
import { GearState, kcsim } from "@fleethub/kcsim"

import { entitiesSlice, gearsSelectors } from "../store"

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

  const kcGear = React.useMemo(() => entity && kcsim.createGear(entity), [entity])

  return { kcGear, actions }
}
