import { DefaultRootState } from "react-redux"

const getPresentState = (root: DefaultRootState) => root.present

export const selectAppState = (root: DefaultRootState) => getPresentState(root).app

export const selectEntitiesState = (root: DefaultRootState) => getPresentState(root).entities
export const selectFilesState = (root: DefaultRootState) => selectEntitiesState(root).files
export const selectPlansState = (root: DefaultRootState) => selectEntitiesState(root).plans

export const selectGearListState = (root: DefaultRootState) => getPresentState(root).gearList
export const selectShipListState = (root: DefaultRootState) => getPresentState(root).shipList
export const selectMapListState = (root: DefaultRootState) => getPresentState(root).mapList
