import { FhCore, MasterDataInput } from "@fleethub/core";
import { createContext, useContext } from "react";

export type FhCoreState = {
  master_data: MasterDataInput;
  core: FhCore;
};

export const FhCoreContext = createContext<FhCoreState | null>(null);

export const useFhCoreContext = () => {
  const contextValue = useContext(FhCoreContext);

  if (!contextValue) {
    throw new Error("could not find context value");
  }

  return contextValue;
};

export const useFhCore = () => {
  const { core, master_data } = useFhCoreContext();

  const findShipClassName = (ctype: number) =>
    master_data.ship_classes.find((sc) => sc.id === ctype)?.name || "";

  const findGearTypeName = (id: number) => core.find_gear_gear_type_name(id);

  return {
    master_data,
    core,
    findShipClassName,
    findGearTypeName,
  };
};

export const useMasterShip = (shipId: number) => {
  const { master_data } = useFhCoreContext();

  const ship = master_data.ships.find((ship) => ship.ship_id === shipId);

  return ship;
};
