import { GearKey } from "../common"
import { GearBase } from "../gear"
import { EquipmentState, Equipment } from "../equipment"

import { MasterShip } from "../MasterDataAdapter"

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
  increase: number
  naked: number
  equipment: number
  bonus: number
  displayed: number
}

export type MaxHp = {
  increase: number
  displayed: number
  limit: number
}

export type Speed = {
  naked: number
  bonus: number
  displayed: number
}

export type Range = {
  naked: MasterShip["range"]
  equipment: number
  bonus: number
  displayed: number
}

export type Luck = {
  increase: number
  displayed: number
}

export type Accuracy = {
  equipment: number
  bonus: number
  displayed: number
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
export type DamageState = "Less" | "Shouha" | "Chuuha" | "Taiha" | "Sunk"

export type Health = {
  maxHp: number
  currentHp: number
  damage: DamageState
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
    makeGetNextBonuses: (excludedKey: GearKey) => (gear: GearBase) => EquipmentBonuses

    fleetLosFactor: number
    cruiserFitBonus: number
    isCarrierLike: boolean
    calcAirPower: (isAntiInstallation?: boolean) => number

    basicAccuracyTerm: number
    basicEvasionTerm: number

    fleetAntiAir: number
  }
