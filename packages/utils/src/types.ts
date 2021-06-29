import { Dict } from "./utilityTypes";

export type GearState = {
  id?: string;
  gear_id: number;
  stars?: number;
  exp?: number;
};

export const GEAR_KEYS = ["g1", "g2", "g3", "g4", "g5", "gx"] as const;
export type GearKey = typeof GEAR_KEYS[number];

export const SLOT_SIZE_KEYS = ["ss1", "ss2", "ss3", "ss4", "ss5"] as const;
export type SlotSizeKey = typeof SLOT_SIZE_KEYS[number];

export type GearStateDict = Dict<GearKey, GearState> &
  Dict<SlotSizeKey, number>;

export type ShipState = {
  id?: string;
  ship_id: number;
  level?: number;
} & GearStateDict;

export const SHIP_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const;
export type ShipKey = typeof SHIP_KEYS[number];

export type FleetState = { id?: string } & Dict<ShipKey, ShipState>;

export type AirSquadronState = { id?: string } & GearStateDict;

export const AIR_SQUADRON_KEYS = ["a1", "a2", "a3"] as const;
export type AirSquadronKey = typeof AIR_SQUADRON_KEYS[number];
export type LandBaseState = Dict<AirSquadronKey, AirSquadronState>;

export const ROLES = ["main", "escort", "route_sup", "boss_sup"] as const;
export type Role = typeof ROLES[number];

export type PlanState = { id?: string; hq_level?: number } & Record<
  Role,
  FleetState
> &
  LandBaseState;

type EntityId = string | number;

export type FhEntity<T extends Record<string, unknown>, K extends keyof T> = {
  id: EntityId;
} & Omit<T, K> &
  Dict<K, EntityId>;
