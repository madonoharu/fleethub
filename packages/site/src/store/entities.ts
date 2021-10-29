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
} from "@fh/utils";
import {
  AppThunk,
  createAction,
  createAsyncThunk,
  createSelector,
  isAnyOf,
  nanoid,
} from "@reduxjs/toolkit";
import {
  AttackPowerModifiers,
  MasterData,
  NightSituation,
  OrgState,
  Ship,
  ShipState,
} from "fleethub-core";
import cloneDeepWith from "lodash/cloneDeepWith";
import mapKeys from "lodash/mapKeys";
import xor from "lodash/xor";
import { createCachedSelector } from "re-reselect";
import { DefaultRootState } from "react-redux";
import { createStructuredSelector } from "reselect";
import { MapEnemySelectEvent } from "../components/templates/MapSelect/MapMenu";
import { SwapEvent } from "../hooks";

import {
  createDeepEqualSelector,
  createShallowEqualSelector,
  getPublicId,
  readPublicFile,
  importFromJor,
  parsePredeck,
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
import { GearPosition } from "./gearsSlice";
import {
  denormalizeOrg,
  FileEntity,
  FolderEntity,
  NormalizedDictionaries,
  NormalizedEntities,
  normalizeOrgState,
  normalizeShipState,
  PlanFileEntity,
  StepConfig,
  StepEntity,
} from "./schema";
import { stepsSelectors } from ".";

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

// todo!
// const toRecord = <T>(dict: Dictionary<T>): Record<string, T> => {
//   const result: Record<string, T> = {};

//   for (const k in dict) {
//     const v = dict[k];
//     if (v) {
//       result[k] = v;
//     }
//   }

//   return result;
// };
// const toNormalizedEntities = (
//   entities: NormalizedDictionaries
// ): NormalizedEntities => {
//   const result: NormalizedEntities = {};

//   for (const key in entities) {
//     const k = key as "files";
//     const dict = entities[k];
//     if (dict) {
//       result[k] = toRecord(dict);
//     }
//   }

//   return result;
// };

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

const getReferencedFiles = (state: FilesState, id: string): FileEntity[] => {
  const file = state.entities[id];

  if (!file) return [];

  if (!isFolder(file)) return [file];

  return [
    file,
    ...file.children.flatMap((childId) => getReferencedFiles(state, childId)),
  ];
};

export const selectTempIds = createSelector(
  (root: DefaultRootState) => root.present.files,
  (state) => {
    return state.tempIds
      .flatMap((id) => getReferencedFiles(state, id))
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

const selectReferencedEntitiesByOrgIds = createShallowEqualSelector(
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

const entityArrayToRecord = <T extends { id: string }>(
  array: T[]
): Record<string, T> => {
  const result: Record<string, T> = {};

  array.forEach((entity) => {
    result[entity.id] = entity;
  });

  return result;
};

export const getReferencedEntities = (
  root: DefaultRootState,
  fileId: string | string[]
): NormalizedEntities => {
  const result: NormalizedEntities = {};

  const files: FileEntity[] = [];
  if (Array.isArray(fileId)) {
    files.push(
      ...fileId.flatMap((id) => getReferencedFiles(root.present.files, id))
    );
  } else {
    files.push(...getReferencedFiles(root.present.files, fileId));
  }

  const planFiles = files.filter(isPlanFile);

  result.files = entityArrayToRecord(files);

  const steps = planFiles
    .flatMap((file) => {
      return file.steps?.map((id) => stepsSelectors.selectById(root, id));
    })
    .filter(nonNullable);

  result.steps = entityArrayToRecord(steps);

  const orgIds = [
    ...planFiles.map((file) => file.org),
    ...steps.map((step) => step.org),
  ];

  const orgReferencedEntities = selectReferencedEntitiesByOrgIds(root, orgIds);
  mergeNormalizedEntities(result, orgReferencedEntities);

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

  const base: NormalizedEntities = cloneDeepWith(
    sauceEntities,
    (value, key) => {
      if (
        key !== "name" &&
        key !== "description" &&
        typeof value === "string" &&
        idMap.has(value)
      ) {
        return getNextId(value);
      }
      return;
    }
  );

  const entities = mapValues(
    base,
    (obj) => obj && mapKeys(obj, (_, k) => getNextId(k))
  ) as NormalizedEntities;

  return { entities, idMap };
};

export type SetEntitiesPayload = {
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

export type ShipPosition =
  | { tag: "fleet"; id: string; key: ShipKey }
  | { tag: "shipDetails" };

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
    const state: ShipState = ship.state();

    const normalized = normalizeShipState(state, id);

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

export const createSetEntitiesPayloadByOrg = (arg: {
  name?: string;
  org?: OrgState;
  to?: string;
}): SetEntitiesPayload => {
  const normalized = normalizeOrgState(arg?.org || {});

  const fileId = nanoid();

  const file: PlanFileEntity = {
    id: fileId,
    org: normalized.result,
    type: "plan",
    name: arg.name || "",
    description: "",
    steps: [],
  };

  const entities = normalized.entities;
  entities.files = {
    [fileId]: file,
  };

  return {
    fileId,
    entities,
    to: arg.to,
  };
};

export const createPlan = createAction(
  "entities/createPlan",
  (arg: Parameters<typeof createSetEntitiesPayloadByOrg>[0]) => ({
    payload: createSetEntitiesPayloadByOrg(arg),
  })
);

export const initalNightSituation: NightSituation = {
  night_contact_rank: null,
  searchlight: false,
  starshell: false,
};

export const initalAttackPowerModifiers: AttackPowerModifiers = {
  a11: 1,
  a12: 1,
  a13: 1,
  a13_2: 1,
  a14: 1,
  a5: 1,
  a6: 1,
  a7: 1,
  b11: 0,
  b12: 0,
  b13: 0,
  b13_2: 0,
  b14: 0,
  b5: 0,
  b6: 0,
  b7: 0,
};

export const initalStepConfig: StepConfig = {
  air_state: "AirSupremacy",
  engagement: "Parallel",
  player: {
    formation: "LineAhead",
    night_situation: initalNightSituation,
    external_power_mods: initalAttackPowerModifiers,
  },
  enemy: {
    formation: "LineAhead",
    night_situation: initalNightSituation,
    external_power_mods: initalAttackPowerModifiers,
  },
};

export const createStep = createAction(
  "entities/createStep",
  (fileId: string, event: MapEnemySelectEvent) => {
    const { result, entities } = normalizeOrgState(event.org);

    const stepId = nanoid();

    const step: StepEntity = {
      id: stepId,
      name: event.name,
      type: event.type,
      d: event.d,
      org: result,
      config: {
        ...initalStepConfig,
        enemy: {
          ...initalStepConfig.enemy,
          formation: event.formation,
        },
      },
    };

    return {
      payload: {
        fileId,
        stepId,
        entities: {
          ...entities,
          steps: [step],
        },
      },
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
    const referencedEntities = getReferencedEntities(root, sourceId);

    const cloned = cloneNormalizedEntities(referencedEntities);
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

    const entities = getReferencedEntities(root, rootFileIds);
    const { files, steps, orgs, fleets, airSquadrons, ships, gears } = entities;

    const fileIds = files ? Object.keys(files) : [];
    const stepIds = steps ? Object.keys(steps) : [];
    const orgIds = orgs ? Object.keys(orgs) : [];
    const fleetIds = fleets ? Object.keys(fleets) : [];
    const airSquadronIds = airSquadrons ? Object.keys(airSquadrons) : [];
    const shipIds = ships ? Object.keys(ships) : [];
    const gearIds = gears ? Object.keys(gears) : [];

    const payload = {
      files: xor(fileIds, filesSelectors.selectIds(root) as string[]),
      steps: xor(stepIds, stepsSelectors.selectIds(root) as string[]),
      orgs: xor(orgIds, orgsSelectors.selectIds(root) as string[]),
      fleets: xor(fleetIds, fleetsSelectors.selectIds(root) as string[]),
      airSquadrons: xor(
        airSquadronIds,
        airSquadronsSelectors.selectIds(root) as string[]
      ),
      ships: xor(shipIds, shipsSelectors.selectIds(root) as string[]),
      gears: xor(gearIds, gearsSelectors.selectIds(root) as string[]),
    };

    dispatch(sweep(payload));
  };

export const isEntitiesAction = isAnyOf(
  createPlan,
  createStep,
  setEntities,
  importEntities,
  createShip
);

export type PublicFile = {
  fileId: string;
  entities: NormalizedEntities;
};

export const publishFile = createAsyncThunk(
  "entities/publishFile",
  async (arg: { fileId: string; tweets?: boolean }, thunkAPI) => {
    const { fileId, tweets } = arg;
    const root = thunkAPI.getState() as DefaultRootState;
    const referencedEntities = getReferencedEntities(root, fileId);

    let count = 0;
    const genId = () => `${(count++).toString(32)}`;

    const cloned = cloneNormalizedEntities(referencedEntities, genId);

    const data: PublicFile = {
      fileId: cloned.idMap.get(fileId) || "",
      entities: cloned.entities,
    };

    const url = await publishFileData(data);

    if (tweets) {
      const name = referencedEntities.files?.[fileId]?.name || "";

      tweet({
        text: name && `【${name}】`,
        url,
      });
    }

    return url;
  }
);

export const parseUrl = async (masterData: MasterData, url: URL) => {
  const publicId = getPublicId(url);
  if (publicId) {
    const res = await readPublicFile(publicId);
    return res;
  }

  if (url.hostname === "jervis.page.link") {
    const res = await importFromJor(url);
    return (
      res &&
      createSetEntitiesPayloadByOrg({
        name: res?.name,
        org: res.org,
      })
    );
  }

  const org = parsePredeck(masterData, url);
  return org && createSetEntitiesPayloadByOrg({ org });
};

export const swapGearPosition = createAction<
  SwapEvent<{ id?: string | undefined; position: GearPosition }>
>("entities/swapGearPosition");

export const swapShipPosition = createAction<
  SwapEvent<{ id?: string | undefined; position: ShipPosition }>
>("entities/swapShipPosition");
