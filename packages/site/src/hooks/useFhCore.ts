import { FhCore, MasterData, Analyzer } from "fleethub-core";
import { createContext, useContext } from "react";

export type FhCoreState = {
  core: FhCore;
  analyzer: Analyzer;
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

export const useMasterShip = (shipId: number) => {
  const { masterData } = useFhCore();

  const ship = masterData.ships.find((ship) => ship.ship_id === shipId);

  return ship;
};
