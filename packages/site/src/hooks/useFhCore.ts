import { FhCore, MasterData, Analyzer, Ship } from "fleethub-core";
import { createContext, useContext } from "react";

export type FhCoreState = {
  core: FhCore;
  analyzer: Analyzer;
  allShips: Ship[];
  masterData: MasterData;
};

export const FhCoreContext = createContext<FhCoreState | null>(null);

export const useFhCore = () => {
  const contextValue = useContext(FhCoreContext);

  if (!contextValue) {
    throw new Error("could not find context value");
  }

  return contextValue;
};
