import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { EntityId } from "@reduxjs/toolkit"

import { entitiesSlice, plansSelectors } from "../store"

export const usePlan = (id: EntityId) => {
  const dispatch = useDispatch()
  const entity = useSelector((state) => plansSelectors.selectById(state.entities, id))

  const actions = React.useMemo(
    () => ({
      createFleet: () => {
        dispatch(entitiesSlice.actions.createFleet({ ships: [...Array(6)] }))
      },
    }),
    [dispatch]
  )

  return { actions, entity }
}

export const useRenderCount = () => {
  const renderCountRef = React.useRef(0)

  React.useDebugValue(`このコンポーネントは${renderCountRef.current}回再描画されました`)

  React.useEffect(() => {
    renderCountRef.current++
  })
}

export * from "./handlers"

export * from "./useFhSystem"

export * from "./useGear"
export * from "./useShip"
export * from "./useFleet"

export * from "./useGearSelectContext"
export * from "./useShipSelect"
