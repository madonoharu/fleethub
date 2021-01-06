import { ShipPosition } from "."
import { isString } from "../utils"

type BattleModifiers = {
  power: number
  accuracy: number
  evasion: number
}

type FormationBattleModifiersDefinition = BattleModifiers | Record<ShipPosition, BattleModifiers>

type FormationDefinition = {
  protectionRate: number
  fleetAntiAir: number
  shelling: FormationBattleModifiersDefinition
  torpedo: FormationBattleModifiersDefinition
  asw: FormationBattleModifiersDefinition
  night: FormationBattleModifiersDefinition
}

enum FormationId {
  LineAhead = 1,
  DoubleLine = 2,
  Diamond = 3,
  Echelon = 4,
  LineAbreast = 5,
  Vanguard = 6,
  Cruising1 = 11,
  Cruising2 = 12,
  Cruising3 = 13,
  Cruising4 = 14,
}

export type Formation = keyof typeof FormationId

export const SingleFleetFormations = [
  "LineAhead",
  "DoubleLine",
  "Diamond",
  "Echelon",
  "LineAbreast",
  "Vanguard",
] as const

export const CombinedFleetFormations = ["Cruising1", "Cruising2", "Cruising3", "Cruising4"] as const

export type FormationDefinitions = Record<Formation, FormationDefinition>
