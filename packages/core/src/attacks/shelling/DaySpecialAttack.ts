import { DaySpecialAttackType } from "./DaySpecialAttackType"
import { fhDefinitions } from "../../FhDefinitions"

type DaySpecialAttackDefinition = {
  name: string
  priority: number
  denominator: number
  power: number
  accuracy: number
}

export type DaySpecialAttackDefinitions = Record<DaySpecialAttackType, DaySpecialAttackDefinition>

export type DaySpecialAttack = {
  type: DaySpecialAttackType
} & DaySpecialAttackDefinition

export const createDaySpecialAttack = (type: DaySpecialAttackType): DaySpecialAttack => {
  const def = fhDefinitions.daySpecialAttacks[type]
  return { type, ...def }
}
