import {
  AirSquadronKey,
  AIR_SQUADRON_KEYS,
  Dict,
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
import {
  AirSquadronState,
  AirState,
  Engagement,
  FleetState,
  GearState,
  OrgState,
  ShipState,
  WarfareAnalyzerShipEnvironment,
} from "fleethub-core";
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

export type GearEntity = { id: string } & GearState;
export type ShipEntity = FhEntity<ShipState, GearKey>;
export type FleetEntity = FhEntity<FleetState, ShipKey>;
export type AirSquadronEntity = FhEntity<AirSquadronState, GearKey>;
export type OrgEntity = FhEntity<OrgState, FleetKey | AirSquadronKey>;

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

type StepConfigShipEnv = Pick<
  WarfareAnalyzerShipEnvironment,
  "formation" | "night_situation" | "external_power_mods"
>;

export type StepConfig = {
  player: StepConfigShipEnv;
  enemy: StepConfigShipEnv;
  air_state: AirState;
  engagement: Engagement;
};

export type StepEntity = {
  id: string;
  name: string;
  type: MapNode["type"];
  d: MapNode["d"];
  org: string;
  config?: StepConfig;
};

export type PlanFileEntity = FileEntityBase<
  "plan",
  {
    org: string;
    steps?: string[];
  }
>;
export type FileEntity = FolderEntity | PlanFileEntity;
export type FileType = FileEntity["type"];

export type PresetEntity = {
  id: string;
  name: string;
} & Dict<GearKey, string>;

export type EntityTypeMap = {
  gears: GearEntity;
  ships: ShipEntity;
  fleets: FleetEntity;
  airSquadrons: AirSquadronEntity;
  orgs: OrgEntity;
  steps: StepEntity;
  files: FileEntity;
  presets: PresetEntity;
};

export type NormalizedEntities = {
  [K in keyof EntityTypeMap]?: Record<string, EntityTypeMap[K]> | undefined;
};

export type NormalizedDictionaries = {
  [K in keyof EntityTypeMap]?: Dictionary<EntityTypeMap[K]> | undefined;
};

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

const org = new schema.Entity<OrgEntity>("orgs", {
  ...Object.fromEntries(FLEET_KEYS.map((key) => [key, fleet] as const)),
  ...Object.fromEntries(
    AIR_SQUADRON_KEYS.map((key) => [key, airSquadron] as const)
  ),
});

const setIdBy = <T extends object & { id?: string | null }, K extends keyof T>(
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

const setIdToGear = (p: GearState) => {
  p.id = nanoid();
};

const setIdToShip = (p: ShipState) => setIdBy(p, GEAR_KEYS, setIdToGear);

const setIdToFleet = (p: FleetState) => setIdBy(p, SHIP_KEYS, setIdToShip);

const setIdToAirSquadron = (p: AirSquadronState) =>
  setIdBy(p, GEAR_KEYS, setIdToGear);

const setIdToOrg = (p: OrgState) => {
  setIdBy(p, FLEET_KEYS, setIdToFleet);
  setIdBy(p, AIR_SQUADRON_KEYS, setIdToAirSquadron);
};

export const normalizeOrgState = (
  params: OrgState
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

export const normalizeShipState = (
  params: ShipState,
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
): ShipState | undefined => {
  return denormalize(id, ship, entities) as ShipState | undefined;
};

export const denormalizeOrg = (
  entities: NormalizedEntities,
  id: string
): OrgState | undefined => {
  return denormalize(id, org, entities) as OrgState | undefined;
};

export const denormalizeOrgs = (
  root: DefaultRootState,
  orgs: string[]
): OrgState[] => {
  const entities = {
    gears: gearsSelectors.selectEntities(root),
    ships: shipsSelectors.selectEntities(root),
    fleets: fleetsSelectors.selectEntities(root),
    airSquadrons: airSquadronsSelectors.selectEntities(root),
    orgs: orgsSelectors.selectEntities(root),
  };

  return (
    denormalize(orgs, [org], entities) as (OrgState | undefined)[]
  ).filter(nonNullable);
};
