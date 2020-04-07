import { useCallback, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import { GearState } from "@fleethub/kcsim"

import { gearSelectSlice, entitiesSlice, GearSelectState } from "../store"

export const useGearSelect = () => {
  const dispatch = useDispatch()
  const state = useSelector((state) => state.gearSelect)

  const open = Boolean(state.position)

  const { setState, onOpen, onClose } = useMemo(() => {
    const setState = (state: Partial<GearSelectState>) => dispatch(gearSelectSlice.actions.set(state))
    const onOpen = setState
    const onClose = () => setState({ position: undefined })
    return { setState, onOpen, onClose }
  }, [dispatch])

  const onSelect = useCallback(
    (gear: GearState) => {
      if (!state.position) return

      dispatch(entitiesSlice.actions.createGear({ ...state.position, gear }))
      onClose()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.position, onClose]
  )

  return { state, setState, open, onOpen, onClose, onSelect }
}
