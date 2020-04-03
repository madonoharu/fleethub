import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { EntityId } from "@reduxjs/toolkit"

import { entitiesSlice, fleetsSelectors } from "../store"

export const usePlan = (uid = "") => {
  const dispatch = useDispatch()
  const allIds: EntityId[] = useSelector(fleetsSelectors.selectIds)

  const actions = React.useMemo(
    () => ({
      createFleet: () => {
        dispatch(entitiesSlice.actions.createFleet({ main: [...Array(6)], escort: [...Array(6)] }))
      },
    }),
    [dispatch, uid]
  )

  return { actions, allIds }
}

export const useRenderCount = () => {
  const renderCountRef = React.useRef(0)

  React.useDebugValue(`このコンポーネントは${renderCountRef.current}回再描画されました`)

  React.useEffect(() => {
    renderCountRef.current++
  })
}

export * from "./handlers"

export * from "./useGear"
export * from "./useShip"
export * from "./useFleet"

export * from "./useGearSelect"
export * from "./useShipSelect"
