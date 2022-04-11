import type { RootState } from "./createStore";

export const getPresentState = (root: RootState) => root.present;

export const selectAppState = (root: RootState) => getPresentState(root).app;

export const selectGkcoiState = (root: RootState) =>
  getPresentState(root).gkcoi;
