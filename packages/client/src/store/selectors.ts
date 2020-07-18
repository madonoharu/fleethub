import { DefaultRootState } from "react-redux"

const getPresentState = (root: DefaultRootState) => root.present

export const selectAppState = (root: DefaultRootState) => getPresentState(root).app

export const selectFilesState = (root: DefaultRootState) => getPresentState(root).entities.files

export const selectGearListState = (root: DefaultRootState) => getPresentState(root).gearList
export const selectShipListState = (root: DefaultRootState) => getPresentState(root).shipList
export const selectMapListState = (root: DefaultRootState) => getPresentState(root).mapList
