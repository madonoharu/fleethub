import { isString } from "../utils"

type BattleModifiers = {
  power: number
  accuracy: number
  evasion: number
}

type FormationBattleModifiersDefinition =
  | BattleModifiers
  | {
      topHalf: BattleModifiers
      bottomHalf: BattleModifiers
    }

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
  CruisingFormation1 = 11,
  CruisingFormation2 = 12,
  CruisingFormation3 = 13,
  CruisingFormation4 = 14,
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

export const CombinedFleetFormations = [
  "CruisingFormation1",
  "CruisingFormation2",
  "CruisingFormation3",
  "CruisingFormation4",
] as const

const Formations = Object.values(FormationId).filter(isString) as Formation[]

export type FormationDefinitions = Record<Formation, FormationDefinition>
