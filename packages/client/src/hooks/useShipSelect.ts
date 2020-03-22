import React from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"

import { shipSelectSlice, entitiesSlice, ShipSelectState } from "../store"

export const useShipSelect = () => {
  const dispatch = useDispatch()
  const position = useSelector((state) => state.shipSelect.position)

  return React.useMemo(() => {
    const setState = (state: ShipSelectState) => {
      dispatch(shipSelectSlice.actions.set(state))
    }

    const open = (state: ShipSelectState) => {
      setState(state)
      navigate("./ships")
    }

    const close = () => {
      setState({ position: undefined })
      navigate("./")
    }

    const onSelect = (shipId: number) => {
      if (!position) return

      dispatch(entitiesSlice.actions.createShip({ ...position, ship: { shipId } }))
      close()
    }

    return { setState, open, close, onSelect }
  }, [dispatch, position])
}
