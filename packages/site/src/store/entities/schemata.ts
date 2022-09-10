/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  AIR_SQUADRON_KEYS,
  FLEET_KEYS,
  GearKey,
  GEAR_KEYS,
  MapNode,
  SHIP_KEYS,
} from "@fh/utils";
import { nanoid } from "@reduxjs/toolkit";
import {
  AirSquadronState,
  FleetState,
  GearState,
  OrgState,
  ShipState,
  NodeAttackAnalyzerConfig,
} from "fleethub-core";
import { schema, EntityType } from "ts-norm";

export type Step = {
  id: string;
  name: string;
  type: MapNode["type"];
  d: MapNode["d"];
  org: OrgState;
  config?: NodeAttackAnalyzerConfig;
};

export type Preset = {
  id: string;
  name: string;
} & Partial<Record<GearKey, GearState>>;

type FileBase<T extends string, P = Record<string, unknown>> = {
  id: string;
  type: T;
  name: string;
  description: string;
} & P;

export type Plan = FileBase<
  "plan",
  {
    org: OrgState;
    steps: Step[];
    activeStep?: Step;
  }
>;
export type Folder = FileBase<
  "folder",
  {
    children: (Plan | Folder)[];
  }
>;
export type FileState = Plan | Folder;
export type FileType = FileState["type"];

function record<K extends string, V>(keys: readonly K[], value: V) {
  const obj = {} as Record<K, V>;
  keys.forEach((key) => {
    obj[key] = value;
  });
  return obj;
}

const idGenerator = nanoid;

const gear = schema<GearState>().entity(
  "gears",
  {},
  {
    idGenerator,
  }
);

const ship = schema<ShipState>().entity("ships", record(GEAR_KEYS, gear), {
  idGenerator,
});

const fleet = schema<FleetState>().entity("fleets", record(SHIP_KEYS, ship), {
  idGenerator,
});

const airSquadron = schema<AirSquadronState>().entity(
  "airSquadrons",
  record(GEAR_KEYS, gear),
  {
    idGenerator,
  }
);

const org = schema<OrgState>().entity(
  "orgs",
  Object.assign(
    record(FLEET_KEYS, fleet),
    record(AIR_SQUADRON_KEYS, airSquadron)
  ),
  {
    idGenerator,
  }
);

const preset = schema<Preset>().entity("presets", record(GEAR_KEYS, gear), {
  idGenerator,
});

const step = schema<Step>().entity("steps", {
  org,
});

const file = schema<FileState>()
  .entity(
    "files",
    {},
    {
      idGenerator,
    }
  )
  .define((self) => ({
    org,
    steps: [step],
    activeStep: step,
    children: [self],
  }));

const obj = {
  gear,
  ship,
  fleet,
  airSquadron,
  org,
  step,
  preset,
  file,
};

export const schemata = Object.assign(Object.values(obj), obj);
export const schemaKeys = schemata.map((schema) => schema.key);

export type SchemaKey = typeof schemaKeys[number];

export type GearEntity = EntityType<typeof gear>;
export type ShipEntity = EntityType<typeof ship>;
export type FleetEntity = EntityType<typeof fleet>;
export type AirSquadronEntity = EntityType<typeof airSquadron>;
export type OrgEntity = EntityType<typeof org>;

export type StepEntity = EntityType<typeof step>;
export type PresetEntity = EntityType<typeof preset>;

export type FileEntity = EntityType<typeof file>;
export type PlanEntity = FileEntity & { type: "plan" };
export type FolderEntity = FileEntity & { type: "folder" };
