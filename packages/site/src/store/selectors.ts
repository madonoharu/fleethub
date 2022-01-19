import { DefaultRootState } from "react-redux";

export const getPresentState = (root: DefaultRootState) => root.present;

export const selectAppState = (root: DefaultRootState) =>
  getPresentState(root).app;

export const selectGkcoiState = (root: DefaultRootState) =>
  getPresentState(root).gkcoi;
