import { Dict } from "./utilityTypes"

export type GearState = {
  gear_id: number
  stars?: number
  exp?: number
}

export const GEAR_KEYS = ["g1", "g2", "g3", "g4", "g5", "gx"] as const
export type GearKey = typeof GEAR_KEYS[number]

export type ShipState = {
  ship_id: number
  level?: number
} & Dict<GearKey, GearState>

export const SHIP_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const
export type ShipKey = typeof SHIP_KEYS[number]

type ShipArrayState = Dict<ShipKey, ShipState>

export const ROLES = ["main", "escort", "route_sup", "boss_sup"] as const
export type Role = typeof ROLES[number]

export type FleetState = Record<Role, ShipArrayState>
