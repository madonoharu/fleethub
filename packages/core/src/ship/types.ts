import { GearKey } from "../common"
import { EquipmentState, Equipment } from "../equipment"
import { MasterShip, MasterGear } from "../MasterDataAdapter"

export { StatInterval, MaybeNumber } from "@fleethub/utils"

export const shipCategoies = [
  "Battleship",
  "AircraftCarrier",
  "HeavyCruiser",
  "LightCruiser",
  "Destroyer",
  "CoastalDefenseShip",
  "Submarine",
  "SupportShip",
] as const

export type ShipCategory = typeof shipCategoies[number]

export type BasicStatKey = "firepower" | "torpedo" | "antiAir" | "armor" | "asw" | "los" | "evasion"

type ShipStatKey = BasicStatKey | "maxHp" | "luck" | "speed" | "range" | "ammo" | "fuel"

export type ShipBaseStats = Pick<MasterShip, ShipStatKey>

export type ShipBase = Omit<MasterShip, ShipStatKey | "id" | "slots" | "stock" | "slotnum" | "nextId" | "nextLevel">

export type BasicStat = {
  diff: number
  naked: number
  equipment: number
  bonus: number
  value: number
}

export type MaxHp = {
  diff: number
  value: number
  limit: number
}

export type Speed = {
  naked: number
  bonus: number
  value: number
}

export type Range = {
  naked: MasterShip["range"]
  equipment: number
  bonus: number
  value: number
}

export type Luck = {
  diff: number
  value: number
}

export type Accuracy = {
  equipment: number
  bonus: number
  value: number
}

/**
 * |||
 * |---|---|
 * | Less   | 無傷 |
 * | Shouha | 小破 |
 * | Chuuha | 中破 |
 * | Taiha  | 大破 |
 * | Sunk   | 轟沈 |
 */
export type HealthState = "Normal" | "Shouha" | "Chuuha" | "Taiha" | "Sunk"

export type HealthBounds = {
  Shouha: number
  Chuuha: number
  Taiha: number
}

export type Health = {
  maxHp: number
  currentHp: number
  bounds: HealthBounds
  getStateByHp: (hp: number) => HealthState
  state: HealthState
  commonPowerModifier: number
  torpedoPowerModifier: number
}

/**
 * |||
 * |---|---|
 * | Sparkling | キラ |
 * | Normal    | 通常 |
 * | Orange    | 橙疲労 |
 * | Red       | 赤疲労 |
 */
export type MoraleState = "Sparkling" | "Normal" | "Orange" | "Red"

export type Morale = {
  value: number
  state: MoraleState
  commonAccuracyModifier: number
  torpedoAccuracyModifier: number
  evasionModifier: number
}

export type Ammo = {
  max: number
  current: number
  penalty: number
}

export type Fuel = {
  max: number
  current: number
  /** 0~75の整数 */
  penalty: number
}

type ShipBasicStats = Record<BasicStatKey, BasicStat>

export type ShipStats = ShipBasicStats & {
  level: number

  maxHp: MaxHp
  speed: Speed
  range: Range
  luck: Luck
  accuracy: Accuracy

  health: Health
  morale: Morale
  ammo: Ammo
  fuel: Fuel
}

type ShipBasicStatsState = Partial<Record<BasicStatKey, number>>

export type ShipStatsState = ShipBasicStatsState & {
  level?: number
  maxHp?: number
  currentHp?: number
  luck?: number
  morale?: number
  ammo?: number
  fuel?: number
}

export type ShipState = {
  shipId: number
} & ShipStatsState &
  EquipmentState

export type EquipmentBonuses = {
  firepower: number
  torpedo: number
  antiAir: number
  armor: number
  evasion: number
  asw: number
  los: number
  bombing: number
  accuracy: number
  range: number

  speed: number
  effectiveLos: number
}

export type Ship = ShipBase &
  ShipStats & {
    state: ShipState

    equipment: Equipment
    makeGetNextBonuses: (excludedKey: GearKey) => (gear: MasterGear) => EquipmentBonuses

    fleetLosFactor: number
    cruiserFitBonus: number
    isCarrierLike: boolean
    calcAirPower: (isAntiInstallation?: boolean) => number

    basicAccuracyTerm: number
    basicEvasionTerm: number

    fleetAntiAir: number
  }
