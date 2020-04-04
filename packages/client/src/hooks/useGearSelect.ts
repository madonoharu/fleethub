import { useCallback, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"

import { gearSelectSlice, entitiesSlice, GearSelectState } from "../store"

export const useGearSelect = () => {
  const dispatch = useDispatch()
  const state = useSelector((state) => state.gearSelect)

  const open = Boolean(state.position)

  const { setState, onOpen, onClose } = useMemo(() => {
    const setState = (state: GearSelectState) => dispatch(gearSelectSlice.actions.set(state))
    const onOpen = setState
    const onClose = () => setState({ position: undefined })
    return { setState, onOpen, onClose }
  }, [dispatch])

  const onSelect = useCallback(
    (gearId: number) => {
      if (!state.position) return

      dispatch(entitiesSlice.actions.createGear({ ...state.position, gear: { gearId } }))
      onClose()
    },
    [state.position, dispatch, onClose]
  )

  return { state, setState, open, onOpen, onClose, onSelect }
}
