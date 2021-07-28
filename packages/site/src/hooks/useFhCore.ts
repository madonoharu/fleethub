import {
  AirSquadronParams,
  FhCore,
  FleetParams,
  MasterDataInput,
  OrgParams,
  Ship,
  ShipParams,
} from "@fleethub/core";
import {
  AIR_SQUADRON_KEYS,
  Dict,
  FLEET_KEYS,
  GEAR_KEYS,
  GearKey,
  SHIP_KEYS,
} from "@fleethub/utils";
import { nanoid } from "@reduxjs/toolkit";
import { createCachedSelector } from "re-reselect";
import { createContext, useCallback, useContext, useMemo } from "react";
import { DefaultRootState, useDispatch, useSelector } from "react-redux";

import {
  airSquadronsSelectors,
  fleetsSelectors,
  GearEntity,
  gearsSelectors,
  OrgEntity,
  orgsSelectors,
  orgsSlice,
  ShipPosition,
  shipsSelectors,
  shipsSlice,
} from "../store";
import { createShallowEqualSelector } from "../utils";

export type FhCoreState = {
  master_data: MasterDataInput;
  core: FhCore;
};

export const FhCoreContext = createContext<FhCoreState | null>(null);

type GearEntityIds = Dict<GearKey, string>;

const selectGearStateDict = (root: DefaultRootState, ids: GearEntityIds) => {
  const state = {} as Record<GearKey, GearEntity | undefined>;

  GEAR_KEYS.forEach((key) => {
    const id = ids[key] || "";
    state[key] = gearsSelectors.selectById(root, id);
  });

  return state;
};

export const selectShipState = createCachedSelector(
  (root: DefaultRootState, id: string): ShipParams | undefined => {
    const entity = shipsSelectors.selectById(root, id);
    if (!entity) return undefined;

    const gearStateDict = selectGearStateDict(root, entity);

    const state: ShipParams = {
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

const selectAirSquadronState = (root: DefaultRootState, id: string) => {
  const entity = airSquadronsSelectors.selectById(root, id);

  if (!entity) return undefined;

  const gearStateDict = selectGearStateDict(root, entity);

  const state = {
    ...entity,
    ...gearStateDict,
  } as AirSquadronParams;

  return state;
};

export const selectFleetState = createCachedSelector(
  (root: DefaultRootState, id: string): FleetParams | undefined => {
    const entity = fleetsSelectors.selectById(root, id);
    if (!entity) return undefined;

    const state: FleetParams = { id: id.toString() };

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

export const selectOrgState = createCachedSelector(
  (root: DefaultRootState, id: string): OrgParams | undefined => {
    const entity = orgsSelectors.selectById(root, id);
    if (!entity) return undefined;

    const state = { ...entity, id: id.toString() } as OrgParams;

    FLEET_KEYS.forEach((key) => {
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

const useFhCoreContext = () => {
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
  const banner = master_data.ship_banners[shipId];

  return { ship, banner };
};

export const useGear = (id?: string) => {
  const { core } = useFhCore();

  const entity = useSelector((root) => {
    return id ? gearsSelectors.selectById(root, id) : undefined;
  });

  const gear = useMemo(
    () => entity && core.create_gear(entity),
    [core, entity]
  );

  return {
    gear,
    entity,
  };
};

export const useFleet = (id: string) => {
  const { core } = useFhCore();

  const state = useSelector((root) => selectFleetState(root, id));
  const dispatch = useDispatch();

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

export const useOrg = (id: string) => {
  const { core } = useFhCore();
  const dispatch = useDispatch();
  const state = useSelector((root) => selectOrgState(root, id));
  const org = state && core.create_org(state);

  const actions = useMemo(() => {
    const update = (changes: Partial<OrgEntity>) => {
      dispatch(orgsSlice.actions.update({ id, changes }));
    };

    const setHqLevel = (hq_level: number) => {
      dispatch(orgsSlice.actions.update({ id, changes: { hq_level } }));
    };

    return { setHqLevel, update };
  }, [dispatch, id]);

  return { org, actions };
};
