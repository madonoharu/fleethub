import {
  ShipData,
  ShipClass,
  ShipClassKey,
  ShipType,
  HullCode,
  equippable as equippableData,
  ShipId,
  ShipRuby,
  GearId,
  GearCategory,
} from "@fleethub/data"

import { GearBase } from "../gear"
import { EquipmentState, GearKey, Equipment } from "../equipment"

import { ShipAttribute } from "./ShipAttribute"

export type StatBase = readonly [number, number]

export type ShipIdentity = Required<
  Pick<ShipData, "sortId" | "shipClass" | "shipType" | "name" | "ruby"> & {
    shipId: ShipData["id"]
  }
>

export type ShipIdentityWithSpeed = ShipIdentity & { speed: number }

export type ShipCommonBase = ShipIdentity & {
  is: (attr: ShipAttribute) => boolean
  canEquip: (gear: GearBase, key?: GearKey) => boolean
}

export type ShipCommonBaseWithStatsBase = ShipCommonBase & ShipStatsBase

export type ShipStatsBase = {
  firepower: StatBase
  torpedo: StatBase
  antiAir: StatBase
  armor: StatBase
  evasion: StatBase
  asw: StatBase
  los: StatBase

  maxHp: StatBase
  luck: StatBase
  speed: number
  range: number

  ammo: number
  fuel: number
}

export type BasicStatKey = "firepower" | "torpedo" | "antiAir" | "armor" | "asw" | "los" | "evasion"

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
}

export type Speed = {
  naked: number
  bonus: number
  displayed: number
}

export type Range = {
  naked: number
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

export type Ship = ShipCommonBase &
  ShipStats & {
    state: ShipState

    equipment: Equipment
    makeGetNextBonuses: (excludedKey: GearKey) => (gear: GearBase) => EquipmentBonuses

    fleetLosFactor: number
    cruiserFitBonus: number
    isCarrierLike: boolean
    calcAirPower: (isAntiInstallation?: boolean) => number

    basicAccuracyTerm: number
  }
