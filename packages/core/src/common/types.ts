export type Side = "Player" | "Enemy"

export type ShipRole = "Main" | "Escort"

export type ShipPosition = "TopHalf" | "BottomHalf"

export type BattleType = "Normal" | "Night" | "NightToDay" | "Aerial" | "AirDefense"

export type SpecialAttackModifiers = {
  power: number
  accuracy: number
}

export type ShellingType =
  | "Normal"
  | "MainMain"
  | "MainApShell"
  | "MainRader"
  | "MainSecond"
  | "DoubleAttack"
  | "Zuiun"
  | "Suisei"
  | "FBA"
  | "BBA"
  | "BA"

export type ShellingTypeDefinition = SpecialAttackModifiers & {
  type: ShellingType
  name: string
  priority: number
  denominator: number
}

export type ShellingTypeDefinitions = Record<ShellingType, ShellingTypeDefinition>
