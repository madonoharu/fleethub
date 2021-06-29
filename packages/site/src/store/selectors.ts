import { DefaultRootState } from "react-redux";

export const getPresentState = (root: DefaultRootState) => root.present;

export const selectAppState = (root: DefaultRootState) =>
  getPresentState(root).app;

export const selectFilesState = (root: DefaultRootState) =>
  getPresentState(root).files;

export const selectGearListState = (root: DefaultRootState) =>
  getPresentState(root).gearList;
export const selectShipListState = (root: DefaultRootState) =>
  getPresentState(root).shipList;
export const selectMapListState = (root: DefaultRootState) =>
  getPresentState(root).mapList;
export const selectGkcoiState = (root: DefaultRootState) =>
  getPresentState(root).gkcoi;

export const selectGearsState = (root: DefaultRootState) =>
  getPresentState(root).gears;
export const selectShipsState = (root: DefaultRootState) =>
  getPresentState(root).ships;
