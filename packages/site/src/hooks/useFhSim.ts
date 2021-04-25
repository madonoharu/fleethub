import { Factory, Fleet, Gear, Ship } from "@fleethub/core";
import {
  FleetState,
  GEAR_KEYS,
  GearState,
  mapValues,
  MasterData,
  Role,
  ShipState,
} from "@fleethub/utils";
import { EntityId, nanoid } from "@reduxjs/toolkit";
import { createCachedSelector } from "re-reselect";
import { createContext, useCallback, useContext, useMemo } from "react";
import { DefaultRootState, useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

import {
  gearsSelectors,
  ShipPosition,
  shipsSelectors,
  shipsSlice,
} from "../store";
import { selectFleet } from "../store/fleetsSlice";
import { createShallowEqualSelector } from "../utils";

export type FhCoreState = {
  master_data: MasterData;
  factory: Factory;
};

export const FhCoreContext = createContext<FhCoreState | null>(null);

const createGearStateSelector = (id: EntityId) =>
  createSelector(
    (root: DefaultRootState) => gearsSelectors.selectById(root, id),
    (entity) => entity
  );

const selectGearState = createCachedSelector(
  gearsSelectors.selectById,
  (entity) => entity
)({ keySelector: (_, id) => id });

export const selectShipState = createCachedSelector(
  (root: DefaultRootState, id: EntityId): ShipState | undefined => {
    const shipEntity = shipsSelectors.selectById(root, id);
    if (!shipEntity) return undefined;

    const state = { ...shipEntity } as ShipState;

    GEAR_KEYS.forEach((key) => {
      const id = shipEntity[key];
      if (id) {
        state[key] = gearsSelectors.selectById(root, id);
      } else {
        delete state[key];
      }
    });

    return state;
  },
  (state) => state
)({
  keySelector: (state, id) => id,
  selectorCreator: createShallowEqualSelector,
});

export const useFhSim = () => {
  const contextValue = useContext(FhCoreContext);

  if (!contextValue) {
    throw new Error("could not find context value");
  }

  const { factory, master_data } = contextValue;

  const createGear = (state: GearState): Gear | undefined => {
    return factory.create_gear(state);
  };

  const createShip = (state: ShipState): Ship | undefined => {
    return factory.create_ship(state);
  };

  const createFleet = (state: FleetState): Fleet | undefined => {
    return factory.create_fleet(state);
  };

  const findShipClassName = (ctype: number) =>
    master_data.ship_classes.find((sc) => sc.id === ctype)?.name || "";

  return {
    master_data,
    factory,
    createGear,
    createShip,
    createFleet,
    findShipClassName,
  };
};

export const useGear = (id?: EntityId) => {
  const { createGear } = useFhSim();

  const entity = useSelector((root) => {
    return id ? gearsSelectors.selectById(root, id) : undefined;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const gear = useMemo(() => entity && createGear(entity), [entity]);

  return {
    gear,
    entity,
  };
};

export const useFleet = (id: EntityId) => {
  const { createFleet } = useFhSim();
  const entity = useSelector((root) => selectFleet(root, id));
  const dispatch = useDispatch();

  const state = useSelector((root) => {
    if (!entity) return;

    const selectShipArrayState = (role: Role) =>
      mapValues(entity[role], (id): ShipState | undefined =>
        id ? selectShipState(root, id) : undefined
      );

    return {
      main: selectShipArrayState("main"),
      escort: selectShipArrayState("escort"),
      route_sup: selectShipArrayState("route_sup"),
      boss_sup: selectShipArrayState("boss_sup"),
    };
  });

  const fleet = state && createFleet(state);
  fleet?.free();

  const setShip = useCallback(
    (position: Omit<ShipPosition, "id">, ship: Ship) => {
      dispatch(
        shipsSlice.actions.add(
          { id: nanoid(), ship_id: ship.ship_id },
          { ...position, id }
        )
      );
    },
    [dispatch, id]
  );

  return { entity, setShip };
};
