import { Factory, Fleet, Gear, Plan, Ship } from "@fleethub/core";
import {
  AIR_SQUADRON_KEYS,
  AirSquadronKey,
  AirSquadronState,
  Dict,
  FleetState,
  GEAR_KEYS,
  GearKey,
  GearState,
  GearStateDict,
  mapValues,
  MasterData,
  PlanState,
  Role,
  ROLES,
  SHIP_KEYS,
  ShipState,
} from "@fleethub/utils";
import { EntityId, nanoid } from "@reduxjs/toolkit";
import { createCachedSelector } from "re-reselect";
import { createContext, useCallback, useContext, useMemo } from "react";
import { DefaultRootState, useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

import {
  airSquadronsSelectors,
  fleetsSelectors,
  gearsSelectors,
  PlanEntity,
  plansSelectors,
  plansSlice,
  ShipEntity,
  ShipPosition,
  shipsSelectors,
  shipsSlice,
} from "../store";
import { createShallowEqualSelector } from "../utils";

export type FhCoreState = {
  master_data: MasterData;
  factory: Factory;
};

export const FhCoreContext = createContext<FhCoreState | null>(null);

type GearEntityIds = Dict<GearKey, EntityId>;

const selectGearStateDict = (root: DefaultRootState, ids: GearEntityIds) => {
  const state: GearStateDict = {};

  GEAR_KEYS.forEach((key) => {
    const id = ids[key] || "";
    state[key] = gearsSelectors.selectById(root, id);
  });

  return state as Record<GearKey, GearState | undefined>;
};

export const selectShipState = createCachedSelector(
  (root: DefaultRootState, id: EntityId): ShipState | undefined => {
    const entity = shipsSelectors.selectById(root, id);
    if (!entity) return undefined;

    const gearStateDict = selectGearStateDict(root, entity);

    const state: ShipState = {
      ...entity,
      ...gearStateDict,
      id: id.toString(),
    };

    return state;
  },
  (state) => state
)({
  keySelector: (_, id) => id,
  selectorCreator: createShallowEqualSelector,
});

const selectAirSquadronState = (root: DefaultRootState, id: EntityId) => {
  const entity = airSquadronsSelectors.selectById(root, id);

  if (!entity) return undefined;

  const gearStateDict = selectGearStateDict(root, entity);

  const state: AirSquadronState = {
    ...entity,
    ...gearStateDict,
    id: id.toString(),
  };

  return state;
};

export const selectFleetState = createCachedSelector(
  (root: DefaultRootState, id: EntityId): FleetState | undefined => {
    const entity = fleetsSelectors.selectById(root, id);
    if (!entity) return undefined;

    const state: FleetState = { id: id.toString() };

    SHIP_KEYS.forEach((key) => {
      const shipEntityId = entity[key];
      if (shipEntityId) {
        state[key] = selectShipState(root, shipEntityId);
      }
    });

    return state;
  },
  (state) => state
)({
  keySelector: (_, id) => id,
  selectorCreator: createShallowEqualSelector,
});

export const selectPlanState = createCachedSelector(
  (root: DefaultRootState, id: EntityId): PlanState | undefined => {
    const entity = plansSelectors.selectById(root, id);
    if (!entity) return undefined;

    const state = { ...entity, id: id.toString() } as PlanState;

    ROLES.forEach((key) => {
      const fleetEntityId = entity[key];
      state[key] =
        (fleetEntityId && selectFleetState(root, fleetEntityId)) || {};
    });

    AIR_SQUADRON_KEYS.forEach((key) => {
      const airSquadronId = entity[key];
      state[key] = airSquadronId
        ? selectAirSquadronState(root, airSquadronId)
        : undefined;
    });

    return state;
  },
  (state) => state
)({
  keySelector: (_, id) => id,
  selectorCreator: createShallowEqualSelector,
});

export const useFhCore = () => {
  const contextValue = useContext(FhCoreContext);

  if (!contextValue) {
    throw new Error("could not find context value");
  }

  const { factory, master_data } = contextValue;

  const findShipClassName = (ctype: number) =>
    master_data.ship_classes.find((sc) => sc.id === ctype)?.name || "";

  const findGearCategoryName = (id: number) =>
    factory.find_gear_category_name(id);

  return {
    master_data,
    factory,
    createGear: (state: GearState) => factory.create_gear(state),
    createShip: (state: ShipState) => factory.create_ship(state),
    createFleet: (state: FleetState) => factory.create_fleet(state),
    createPlan: (state: PlanState) => factory.create_plan(state),
    findShipClassName,
    findGearCategoryName,
  };
};

export const useGear = (id?: EntityId) => {
  const { createGear } = useFhCore();

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
  const { createFleet } = useFhCore();

  const state = useSelector((root) => selectFleetState(root, id));
  const dispatch = useDispatch();

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

  return { setShip };
};

export const usePlan = (id: EntityId) => {
  const { createPlan } = useFhCore();
  const dispatch = useDispatch();
  const state = useSelector((root) => selectPlanState(root, id));
  const plan = state && createPlan(state);

  const actions = useMemo(() => {
    const setHqLevel = (hq_level: number) => {
      dispatch(plansSlice.actions.update({ id, changes: { hq_level } }));
    };

    return { setHqLevel };
  }, [dispatch, id]);

  return { plan, actions };
};
