import { OrgParams, Ship, ShipParams } from "@fleethub/core";
import {
  AIR_SQUADRON_KEYS,
  Dict,
  FLEET_KEYS,
  GearKey,
  GEAR_KEYS,
  mapValues,
  nonNullable,
  ShipKey,
  SHIP_KEYS,
  uniq,
} from "@fleethub/utils";
import {
  AppThunk,
  createAction,
  createAsyncThunk,
  createSelector,
  Dictionary,
  isAnyOf,
  nanoid,
  PrepareAction,
} from "@reduxjs/toolkit";
import cloneDeepWith from "lodash/cloneDeepWith";
import mapKeys from "lodash/mapKeys";
import xor from "lodash/xor";
import { createCachedSelector } from "re-reselect";
import { DefaultRootState } from "react-redux";
import { createStructuredSelector } from "reselect";
import { MapEnemySelectEvent } from "../components/templates/MapList";

import {
  createDeepEqualSelector,
  createShallowEqualSelector,
  fetchUrlData,
  publishFileData,
  tweet,
} from "../utils";
import {
  airSquadronsSelectors,
  filesSelectors,
  fleetsSelectors,
  gearsSelectors,
  orgsSelectors,
  shipsSelectors,
} from "./adapters";
import { FilesState } from "./filesSlice";
import {
  denormalizeOrg,
  FileEntity,
  FolderEntity,
  NormalizedDictionaries,
  NormalizedEntities,
  normalizeOrgParams,
  normalizeShipParams,
  PlanFileEntity,
  PlanNode,
} from "./schema";

export const isFolder = (file?: FileEntity): file is FolderEntity =>
  Boolean(file && "children" in file);

export const isPlanFile = (file?: FileEntity): file is PlanFileEntity =>
  Boolean(file && "org" in file);

const filterEntities = <T>(
  entities: Record<string, T>,
  ids: string[]
): Record<string, NonNullable<T>> => {
  const result: Record<string, NonNullable<T>> = {};

  ids.forEach((id) => {
    const entity = entities[id];

    if (entity) {
      result[id] = entity as NonNullable<T>;
    }
  });

  return result;
};

const toRecord = <T>(dict: Dictionary<T>): Record<string, T> => {
  const result: Record<string, T> = {};

  for (const k in dict) {
    const v = dict[k];
    if (v) {
      result[k] = v;
    }
  }

  return result;
};

const toNormalizedEntities = (
  entities: NormalizedDictionaries
): NormalizedEntities => {
  const result: NormalizedEntities = {};

  for (const key in entities) {
    const k = key as "files";
    const dict = entities[k];
    if (dict) {
      result[k] = toRecord(dict);
    }
  }

  return result;
};

const mergeNormalizedEntities = (
  a: NormalizedEntities,
  b: NormalizedEntities
) => {
  const result: NormalizedEntities = {};
  const keys = uniq([
    ...Object.keys(a),
    ...Object.keys(b),
  ]) as (keyof NormalizedEntities)[];

  keys.forEach(<K extends keyof NormalizedEntities>(key: K) => {
    a[key] ||= {};
    Object.assign(a[key], b[key]);
  });

  return result;
};

export const getLinkedFiles = (state: FilesState, id: string) => {
  const result: Record<string, FileEntity> = {};
  const file = state.entities[id];

  if (!file) return result;

  result[id] = file;

  if (!isFolder(file)) return result;

  file.children.forEach((childId) => {
    Object.assign(result, getLinkedFiles(state, childId));
  });

  return result;
};

export const getLinkedFileEntities = (
  root: DefaultRootState,
  id: string
): Record<string, FileEntity> => {
  const result: Record<string, FileEntity> = {};
  const file = filesSelectors.selectById(root, id);

  if (!file) return result;

  result[id] = file;

  if (!isFolder(file)) return result;

  file.children.forEach((childId) => {
    Object.assign(result, getLinkedFileEntities(root, childId));
  });

  return result;
};

export const selectTempIds = createSelector(
  (root: DefaultRootState) => root.present.files,
  (state) => {
    return state.tempIds
      .flatMap((id) => Object.values(getLinkedFiles(state, id)))
      .map((file) => file.id);
  }
);

const selectOrgAllEntities = createStructuredSelector<
  DefaultRootState,
  Required<Omit<NormalizedDictionaries, "files">>
>({
  orgs: orgsSelectors.selectEntities,
  fleets: fleetsSelectors.selectEntities,
  airSquadrons: airSquadronsSelectors.selectEntities,
  ships: shipsSelectors.selectEntities,
  gears: gearsSelectors.selectEntities,
});

const selectNormalizedOrgState = createCachedSelector(
  (root: DefaultRootState) => selectOrgAllEntities(root),
  (root: DefaultRootState, id: string) => id,
  (entities, id) => {
    const orgs = filterEntities(entities.orgs, [id]);

    const fleetIds = Object.values(orgs)
      .flatMap((org) => org && FLEET_KEYS.map((key) => org[key]))
      .filter(nonNullable);

    const fleets = filterEntities(entities.fleets, fleetIds);

    const airSquadronIds = Object.values(orgs)
      .flatMap((org) => org && AIR_SQUADRON_KEYS.map((key) => org[key]))
      .filter(nonNullable);

    const airSquadrons = filterEntities(entities.airSquadrons, airSquadronIds);

    const shipIds = Object.values(fleets)
      .flatMap((fleet) => fleet && SHIP_KEYS.map((key) => fleet[key]))
      .filter(nonNullable);

    const ships = filterEntities(entities.ships, shipIds);

    const gearIds = Object.values<Dict<GearKey, string> | undefined>(ships)
      .concat(Object.values(airSquadrons))
      .flatMap((parent) => parent && GEAR_KEYS.map((key) => parent[key]))
      .filter(nonNullable);

    const gears = filterEntities(entities.gears, gearIds);

    return {
      orgs,
      airSquadrons,
      fleets,
      ships,
      gears,
    };
  }
)({
  keySelector: (_, id) => id,
});

export const selectOrgState = createCachedSelector(
  selectNormalizedOrgState,
  (entities) => {
    const id = Object.keys(entities.orgs).at(0) || "";
    return denormalizeOrg(entities, id);
  }
)({
  keySelector: (_, id) => id,
  selectorCreator: createDeepEqualSelector,
});

const selectLinkedEntitiesByOrgIds = createShallowEqualSelector(
  (root: DefaultRootState, orgIds: string[]) =>
    orgIds.map((id) => selectNormalizedOrgState(root, id)),

  (orgs) => {
    const result: NormalizedEntities = {};
    orgs.forEach((org) => {
      mergeNormalizedEntities(result, org);
    });
    return result;
  }
);

export const getLinkedEntities = (
  root: DefaultRootState,
  fileId: string
): NormalizedEntities => {
  const result: NormalizedEntities = {};
  result.files = getLinkedFileEntities(root, fileId);

  Object.values(result.files).forEach((file) => {
    if (isPlanFile(file)) {
      const orgIds = [file.org, ...file.nodes.map((node) => node.org)];
      const orgLinkedEntities = selectLinkedEntitiesByOrgIds(root, orgIds);
      mergeNormalizedEntities(result, orgLinkedEntities);
    }
  });

  return result;
};

export const cloneNormalizedEntities = (
  sauceEntities: NormalizedEntities,
  genId = nanoid
) => {
  const keys = Object.keys(sauceEntities) as (keyof NormalizedEntities)[];
  const idMap = new Map<string, string>(
    keys
      .flatMap(<K extends keyof NormalizedEntities>(key: K) =>
        Object.keys(sauceEntities[key] || {})
      )
      .map((id) => [id, genId()] as const)
  );

  const getNextId = (prev: string) => idMap.get(prev) || "";

  const base: NormalizedEntities = cloneDeepWith(sauceEntities, (value) => {
    if (typeof value === "string" && idMap.has(value)) {
      return getNextId(value);
    }
    return;
  });

  const entities = mapValues(
    base,
    (obj) => obj && mapKeys(obj, (_, k) => getNextId(k))
  ) as NormalizedEntities;

  return { entities, idMap };
};

type SetEntitiesPayload = {
  entities: NormalizedEntities;
  fileId: string;
  to?: string | undefined;
};

const cloneSetEntitiesPayload = (
  payload: SetEntitiesPayload
): SetEntitiesPayload => {
  const cloned = cloneNormalizedEntities(payload.entities);

  return {
    ...payload,
    fileId: cloned.idMap.get(payload.fileId) || "",
    entities: cloned.entities,
  };
};

export type ShipPosition = { fleet?: string; key: ShipKey };

type CreateShipArg = {
  ship: Ship;
  position?: ShipPosition | undefined;
  id?: string;
  reselect?: boolean;
};

export const createShip = createAction(
  "entities/createShip",
  (arg: CreateShipArg) => {
    const { ship, position, id, reselect } = arg;
    const state: ShipParams = ship.state();

    const normalized = normalizeShipParams(state, id);

    const payload = {
      id: normalized.result,
      entities: normalized.entities,
      position,
      reselect,
    };

    return { payload };
  }
);

export const selectShip =
  (ship: Ship, id?: string): AppThunk =>
  (dispatch, getState) => {
    const root = getState();
    const shipSelectState = root.present.shipSelect;

    dispatch(
      createShip({
        ship,
        position: shipSelectState.position,
        id: id || shipSelectState.id,
        reselect: shipSelectState.reselect,
      })
    );
  };

export const createPlan = createAction<PrepareAction<SetEntitiesPayload>>(
  "entities/createPlan",
  (arg: { name?: string; org?: OrgParams; to?: string } | undefined) => {
    const normalized = normalizeOrgParams(arg?.org || {});

    const fileId = nanoid();

    const file: PlanFileEntity = {
      id: fileId,
      org: normalized.result,
      type: "plan",
      name: arg?.name || "",
      description: "",
      nodes: [],
    };

    const entities = normalized.entities;
    entities.files = {
      [fileId]: file,
    };

    return {
      payload: { fileId, entities, to: arg?.to },
    };
  }
);

export const createPlanNode = createAction(
  "entities/createPlanNode",
  (fileId: string, event: MapEnemySelectEvent) => {
    const { result, entities } = normalizeOrgParams(event.org);

    const node: PlanNode = {
      name: event.name,
      type: event.type,
      d: event.d,
      enemy_formation: event.formation,
      org: result,
    };

    return {
      payload: { fileId, node, entities },
    };
  }
);

export const setEntities = createAction<SetEntitiesPayload>("entities/set");

export const importEntities = createAction(
  "entities/import",
  (payload: SetEntitiesPayload) => ({
    payload: cloneSetEntitiesPayload(payload),
  })
);

export const sweep =
  createAction<Record<keyof NormalizedEntities, string[]>>("entities/sweep");

export const cloneFile =
  (sourceId: string): AppThunk =>
  (dispatch, getState) => {
    const root = getState();
    const linkedEntities = getLinkedEntities(root, sourceId);

    const cloned = cloneNormalizedEntities(linkedEntities);
    const clonedId = cloned.idMap.get(sourceId);

    let to: string | undefined;

    if (isFolder(filesSelectors.selectById(root, sourceId))) {
      const parentId = filesSelectors
        .selectAll(root)
        .find((file) => isFolder(file) && file.children.includes(sourceId))?.id;

      if (parentId) {
        to = parentId;
      }
    } else {
      to = sourceId;
    }

    dispatch(
      setEntities({
        entities: cloned.entities,
        fileId: clonedId || "",
        to,
      })
    );
  };

export const sweepEntities =
  (removeTemp = false): AppThunk =>
  (dispatch, getState) => {
    const root = getState();

    const rootFileIds = root.present.files.rootIds.concat();
    if (!removeTemp) {
      rootFileIds.push(...root.present.files.tempIds);
    }

    const entities: NormalizedEntities = {};

    rootFileIds.forEach((fileId) => {
      const linkedEntities = getLinkedEntities(root, fileId);
      mergeNormalizedEntities(entities, linkedEntities);
    });

    const { files, orgs, fleets, airSquadrons, ships, gears } = entities;

    const fileIds = files ? Object.keys(files) : [];
    const orgIds = orgs ? Object.keys(orgs) : [];
    const fleetIds = fleets ? Object.keys(fleets) : [];
    const airSquadronIds = airSquadrons ? Object.keys(airSquadrons) : [];
    const shipIds = ships ? Object.keys(ships) : [];
    const gearIds = gears ? Object.keys(gears) : [];

    dispatch(
      sweep({
        files: xor(fileIds, filesSelectors.selectIds(root) as string[]),
        orgs: xor(orgIds, orgsSelectors.selectIds(root) as string[]),
        fleets: xor(fleetIds, fleetsSelectors.selectIds(root) as string[]),
        airSquadrons: xor(
          airSquadronIds,
          airSquadronsSelectors.selectIds(root) as string[]
        ),
        ships: xor(shipIds, shipsSelectors.selectIds(root) as string[]),
        gears: xor(gearIds, gearsSelectors.selectIds(root) as string[]),
      })
    );
  };

export const isEntitiesAction = isAnyOf(
  createPlan,
  createPlanNode,
  setEntities,
  importEntities,
  createShip
);

export type PublicData = {
  fileId: string;
  entities: NormalizedEntities;
};

export const publishFile = createAsyncThunk(
  "entities/publishFile",
  async (arg: { fileId: string; tweets?: boolean }, thunkAPI) => {
    const { fileId, tweets } = arg;
    const root = thunkAPI.getState() as DefaultRootState;
    const linkedEntities = getLinkedEntities(root, fileId);

    let count = 0;
    const genId = () => `${count++}`;

    const cloned = cloneNormalizedEntities(linkedEntities, genId);

    const data: PublicData = {
      fileId: cloned.idMap.get(fileId) || "",
      entities: cloned.entities,
    };

    const url = await publishFileData(data);

    if (tweets) {
      const name = linkedEntities.files?.[fileId]?.name || "";

      tweet({
        text: name && `【${name}】`,
        url,
      });
    }

    return url;
  }
);

export const fetchLocationData = (): AppThunk => async (dispatch) => {
  if (!process.browser) return;

  const data = await fetchUrlData(location.href);
  window.history.replaceState(null, "", location.origin);

  if (data) {
    dispatch(importEntities({ ...data, to: "temp" }));
  }
};
