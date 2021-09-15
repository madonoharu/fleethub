import {
  AirSquadronParams,
  AirState,
  Engagement,
  FleetParams,
  Formation,
  GearParams,
  NightSituation,
  OrgParams,
  ShipParams,
} from "@fh/core";
import {
  AirSquadronKey,
  AIR_SQUADRON_KEYS,
  FhEntity,
  FleetKey,
  FLEET_KEYS,
  GearKey,
  GEAR_KEYS,
  MapNode,
  nonNullable,
  ShipKey,
  SHIP_KEYS,
} from "@fh/utils";
import { Dictionary, nanoid } from "@reduxjs/toolkit";
import cloneDeep from "lodash/cloneDeep";
import { normalize, schema, NormalizedSchema, denormalize } from "normalizr";
import { DefaultRootState } from "react-redux";
import {
  airSquadronsSelectors,
  fleetsSelectors,
  gearsSelectors,
  orgsSelectors,
  shipsSelectors,
} from "./adapters";

export type GearEntity = { id: string } & GearParams;
export type ShipEntity = FhEntity<ShipParams, GearKey>;
export type FleetEntity = FhEntity<FleetParams, ShipKey>;
export type AirSquadronEntity = FhEntity<AirSquadronParams, GearKey>;
export type OrgEntity = FhEntity<OrgParams, FleetKey | AirSquadronKey>;

type FileEntityBase<T extends string, P = Record<string, unknown>> = {
  id: string;
  type: T;
  name: string;
  description: string;
} & P;

export type FolderEntity = FileEntityBase<
  "folder",
  {
    children: string[];
  }
>;

export type PlanNode = {
  name: string;
  type: MapNode["type"];
  d: MapNode["d"];
  org: string;
  air_state?: AirState;
  engagement?: Engagement;
  player_formation?: Formation;
  enemy_formation?: Formation;
  playerNightSituation?: NightSituation;
  enemyNightSituation?: NightSituation;
};

export type PlanFileEntity = FileEntityBase<
  "plan",
  {
    org: string;
    nodes: PlanNode[];
  }
>;
export type FileEntity = FolderEntity | PlanFileEntity;
export type FileType = FileEntity["type"];

const gear = new schema.Entity<GearEntity>("gears");

const ship = new schema.Entity<ShipEntity>(
  "ships",
  Object.fromEntries(GEAR_KEYS.map((key) => [key, gear] as const))
);

const fleet = new schema.Entity<FleetEntity>(
  "fleets",
  Object.fromEntries(SHIP_KEYS.map((key) => [key, ship] as const))
);

const airSquadron = new schema.Entity<AirSquadronEntity>(
  "airSquadrons",
  Object.fromEntries(GEAR_KEYS.map((key) => [key, gear] as const))
);

const org = new schema.Entity<OrgEntity>(
  "orgs",
  Object.fromEntries([
    ...FLEET_KEYS.map((key) => [key, fleet] as const),
    ...AIR_SQUADRON_KEYS.map((key) => [key, airSquadron] as const),
  ])
);

const setIdBy = <
  T extends Record<string, unknown> & { id?: string | null },
  K extends keyof T
>(
  p: T,
  keys: readonly K[],
  nest: (v: NonNullable<T[K]>) => void
) => {
  p.id = nanoid();
  keys
    .map((k) => p[k])
    .filter(nonNullable)
    .forEach(nest);
};

const setIdToGear = (p: GearParams) => {
  p.id = nanoid();
};

const setIdToShip = (p: ShipParams) => setIdBy(p, GEAR_KEYS, setIdToGear);

const setIdToFleet = (p: FleetParams) => setIdBy(p, SHIP_KEYS, setIdToShip);

const setIdToAirSquadron = (p: AirSquadronParams) =>
  setIdBy(p, GEAR_KEYS, setIdToGear);

const setIdToOrg = (p: OrgParams) => {
  setIdBy(p, FLEET_KEYS, setIdToFleet);
  setIdBy(p, AIR_SQUADRON_KEYS, setIdToAirSquadron);
};

export type NormalizedEntities = {
  gears?: Record<string, GearEntity> | undefined;
  ships?: Record<string, ShipEntity> | undefined;
  fleets?: Record<string, FleetEntity> | undefined;
  airSquadrons?: Record<string, AirSquadronEntity> | undefined;
  orgs?: Record<string, OrgEntity> | undefined;
  files?: Record<string, FileEntity> | undefined;
};

export type NormalizedDictionaries = {
  gears?: Dictionary<GearEntity> | undefined;
  ships?: Dictionary<ShipEntity> | undefined;
  fleets?: Dictionary<FleetEntity> | undefined;
  airSquadrons?: Dictionary<AirSquadronEntity> | undefined;
  orgs?: Dictionary<OrgEntity> | undefined;
  files?: Dictionary<FileEntity> | undefined;
};

export const normalizeOrgParams = (
  params: OrgParams
): NormalizedSchema<NormalizedEntities, string> => {
  const cloned = cloneDeep({
    f1: {},
    f2: {},
    f3: {},
    f4: {},
    a1: {},
    a2: {},
    a3: {},
    ...params,
  });

  setIdToOrg(cloned);

  const normalized = normalize(cloned, org);
  Object.values(normalized.entities).forEach((e) => {
    if (e) delete e["undefined"];
  });

  return normalize(cloned, org);
};

export const normalizeShipParams = (
  params: ShipParams,
  id?: string
): NormalizedSchema<NormalizedEntities, string> => {
  setIdToShip(params);

  if (id) {
    params.id = id;
  }

  return normalize(params, ship);
};

export const denormalizeShip = (
  entities: NormalizedEntities,
  id: string
): ShipParams | undefined => {
  return denormalize(id, ship, entities) as ShipParams | undefined;
};

export const denormalizeOrg = (
  entities: NormalizedEntities,
  id: string
): OrgParams | undefined => {
  return denormalize(id, org, entities) as OrgParams | undefined;
};

export const denormalizeOrgs = (
  root: DefaultRootState,
  orgs: string[]
): OrgParams[] => {
  const entities = {
    gears: gearsSelectors.selectEntities(root),
    ships: shipsSelectors.selectEntities(root),
    fleets: fleetsSelectors.selectEntities(root),
    airSquadrons: airSquadronsSelectors.selectEntities(root),
    orgs: orgsSelectors.selectEntities(root),
  };

  return (
    denormalize(orgs, [org], entities) as (OrgParams | undefined)[]
  ).filter(nonNullable);
};
