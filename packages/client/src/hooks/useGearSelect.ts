import React from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"

import { gearSelectSlice, entitiesSlice, GearSelectState } from "../store"

export const useGearSelect = () => {
  const dispatch = useDispatch()
  const position = useSelector((state) => state.gearSelect.position)

  return React.useMemo(() => {
    const setState = (state: GearSelectState) => {
      dispatch(gearSelectSlice.actions.set(state))
    }

    const open = (state: GearSelectState) => {
      setState(state)
      navigate("./gears")
    }

    const close = () => {
      setState({ position: undefined })
      navigate("./")
    }

    const onSelect = (gearId: number) => {
      if (!position) return

      dispatch(entitiesSlice.actions.createGear({ ...position, gear: { gearId } }))
      close()
    }

    return { open, close, onSelect }
  }, [dispatch, position])
}
