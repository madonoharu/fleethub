import React from "react"
import { useSelector } from "react-redux"
import { EntityId } from "@reduxjs/toolkit"

import { makeGetShipState } from "../store"

import { useFhSystem } from "./useFhSystem"

export const useFhShip = (id: EntityId) => {
  const getShipState = React.useMemo(makeGetShipState, [id])
  const fhSystem = useFhSystem()

  const state = useSelector((state) => getShipState(state, id))
  return React.useMemo(() => state && fhSystem.createShip(state), [fhSystem, state])
}
