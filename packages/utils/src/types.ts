import { Dict } from "./utilityTypes";

export type GearState = {
  gear_id: number;
  stars?: number;
  exp?: number;
};

export const GEAR_KEYS = ["g1", "g2", "g3", "g4", "g5", "gx"] as const;
export type GearKey = typeof GEAR_KEYS[number];

export const SLOT_SIZE_KEYS = ["ss1", "ss2", "ss3", "ss4", "ss5"] as const;
export type SlotSizeKey = typeof SLOT_SIZE_KEYS[number];

type EquipmentState = Dict<GearKey, GearState> & Dict<SlotSizeKey, number>;

export type ShipState = {
  ship_id: number;
  level?: number;
} & EquipmentState;

export const SHIP_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const;
export type ShipKey = typeof SHIP_KEYS[number];
type ShipArrayState = Dict<ShipKey, ShipState>;

export type AirbaseState = EquipmentState;

export const AIRBASE_KEYS = ["a1", "a2", "a3"];
export type AirbaseKey = typeof AIRBASE_KEYS[number];
type AirbaseArrayState = Dict<AirbaseKey, AirbaseState>;

export const ROLES = ["main", "escort", "route_sup", "boss_sup"] as const;
export type Role = typeof ROLES[number];

export type FleetState = Record<Role, ShipArrayState> & AirbaseArrayState;
