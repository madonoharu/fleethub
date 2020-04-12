import { gears, ships } from "@fleethub/data"

import Factory from "./Factory"
import FhSystem from "./FhSystem"

const factory = new Factory({ gears, ships })
export const fhSystem = new FhSystem(factory)

type EquipmentBonusKey =
  | "firepower"
  | "torpedo"
  | "antiAir"
  | "asw"
  | "bombing"
  | "accuracy"
  | "evasion"
  | "interception"
  | "antiBomber"
  | "los"
  | "armor"
  | "range"

export type EquipmentBonuses = Partial<Record<EquipmentBonusKey, number>>

export * from "./ship"
export * from "./gear"
export * from "./utils"

export { ShipClass, ShipClassKey, ShipType, ShipTypeKey } from "@fleethub/data"
