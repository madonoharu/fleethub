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
import { ShipAttribute } from "./ShipAttribute"
import { GearBase, GearState } from "../gear"
import { NullableArray } from "../utils"

export type StatBase = readonly [number, number]

/**
 * 潜在艦速区分
 */
export enum SpeedGroup {
  FastA,
  FastB1SlowA,
  FastB2SlowB,
  OtherC,
}

export type ShipIdentityBase = Required<
  Pick<ShipData, "sortId" | "shipClass" | "shipType" | "name" | "ruby"> & {
    shipId: ShipData["id"]
  }
>

export type ShipAttributeParams = ShipIdentityBase & { speed: number }

export type ShipIdentity = ShipIdentityBase & { is: (attr: ShipAttribute) => boolean }

export type ShipCommonBase = ShipIdentity & {
  canEquip: (index: number, gear: GearBase) => boolean
}

export type ShipCommonBaseWithStatsBase = ShipCommonBase & ShipStatsBase

export type ShipStatsBase = {
  maxHp: StatBase
  firepower: StatBase
  armor: StatBase
  torpedo: StatBase
  antiAir: StatBase
  evasion: StatBase
  asw: StatBase
  los: StatBase
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
  gears?: NullableArray<GearState>
  slots?: number[]
} & ShipStatsState
