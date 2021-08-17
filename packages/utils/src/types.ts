import { Dict } from "./utilityTypes";

export const GEAR_KEYS = ["g1", "g2", "g3", "g4", "g5", "gx"] as const;
export type GearKey = typeof GEAR_KEYS[number];

export const SLOT_SIZE_KEYS = ["ss1", "ss2", "ss3", "ss4", "ss5"] as const;
export type SlotSizeKey = typeof SLOT_SIZE_KEYS[number];

export const SHIP_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const;
export type ShipKey = typeof SHIP_KEYS[number];

export const AIR_SQUADRON_KEYS = ["a1", "a2", "a3"] as const;
export type AirSquadronKey = typeof AIR_SQUADRON_KEYS[number];

export const FLEET_KEYS = ["f1", "f2", "f3", "f4"] as const;
export type FleetKey = typeof FLEET_KEYS[number];

export type FhEntity<T extends Record<string, unknown>, K extends keyof T> = {
  id: string;
} & Omit<T, K> &
  Dict<K, string>;

export enum MapNodeType {
  Lbas = -2,
  Unknown = -1,
  Start = 0,
  Resource = 2,
  Maelstrom = 3,
  Normal = 4,
  Boss = 5,
  Transport = 6,
  Aerial = 7,
  Bounty = 8,
  AerialReconnaissance = 9,
  AirDefense = 10,
  NightBattle = 11,
  LongRangeRadarAmbush = 13,
  EmergencyAnchorageRepair = 14,

  NoEnemy = 90,
  Selector = 91,
}

export type MapEnemyFleet = {
  main: number[];
  escort?: number[];
  formations: number[];
  diff?: number;
  fp: [number, number, number, number];
  lbasFp: [number, number, number, number];
};

export type MapNode = {
  point: string;
  x: number;
  y: number;
  type: number;
  d?: number;
  enemies?: MapEnemyFleet[];
};

export type MapLink = [string, string];

export type FhMap = {
  id: number;
  nodes: MapNode[];
  links: MapLink[];
};
