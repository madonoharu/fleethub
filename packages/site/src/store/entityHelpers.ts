import {
  AIR_SQUADRON_KEYS,
  Dict,
  FLEET_KEYS,
  GearKey,
  GEAR_KEYS,
  mapValues,
  nonNullable,
  SHIP_KEYS,
  uniq,
} from "@fh/utils";
import { createSelector, nanoid } from "@reduxjs/toolkit";
import cloneDeepWith from "lodash/cloneDeepWith";
import mapKeys from "lodash/mapKeys";
import { createCachedSelector } from "re-reselect";
import { DefaultRootState } from "react-redux";
import { createStructuredSelector } from "reselect";

import { createDeepEqualSelector, createShallowEqualSelector } from "../utils";
import {
  airSquadronsSelectors,
  fleetsSelectors,
  gearsSelectors,
  orgsSelectors,
  shipsSelectors,
  stepsSelectors,
} from "./adapters";
import { FilesState } from "./filesSlice";
import {
  denormalizeOrg,
  FileEntity,
  FolderEntity,
  NormalizedDictionaries,
  NormalizedEntities,
  PlanFileEntity,
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

export const mergeNormalizedEntities = (
  target: NormalizedEntities,
  ...rest: NormalizedEntities[]
): NormalizedEntities => {
  const keys = uniq(
    rest.flatMap((e) => Object.keys(e))
  ) as (keyof NormalizedEntities)[];

  keys.forEach((key) => {
    target[key] ||= {};
    Object.assign(target[key] as object, ...rest.map((e) => e[key]));
  });

  return target;
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
  Required<
    Pick<
      NormalizedDictionaries,
      "orgs" | "fleets" | "airSquadrons" | "ships" | "gears"
    >
  >
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
