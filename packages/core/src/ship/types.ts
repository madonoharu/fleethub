type BasicStatKey = "firepower" | "torpedo" | "antiAir" | "armor"
type IncreasingStatKey = "asw" | "los" | "evasion"

type EquipmentRelatedStatKey = BasicStatKey | IncreasingStatKey

export type ShipStat = {
  left?: number
  right?: number
  naked?: number
  displayed: number

  revised?: number
  equipment?: number
  bonus?: number
}

/**
 * Less 無傷
 * Shouha 小破
 * Chuuha 中破
 * Taiha 大破
 * Sunk 轟沈
 */
export type DamageState = "Less" | "Shouha" | "Chuuha" | "Taiha" | "Sunk"

export type Health = {
  maxHp: number
  currentHp: number
  damage: DamageState
  commonPowerModifier: number
  torpedoPowerModifier: number
}

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

export type ShipStats = {
  health: Health
  morale: Morale
  ammo: Ammo
  fuel: Fuel
}

export type ShipOptionalState = {
  level?: number
  currentHp?: number
  morale?: number
  ammo?: number
  fuel?: number
}
