import { DefaultRootState } from "react-redux"

export const getState = (root: DefaultRootState) => root.present

export const selectAppState = (root: DefaultRootState) => getState(root).app

export const selectGearListState = (root: DefaultRootState) => getState(root).gearList
export const selectShipListState = (root: DefaultRootState) => getState(root).shipList
export const selectMapListState = (root: DefaultRootState) => getState(root).mapList
