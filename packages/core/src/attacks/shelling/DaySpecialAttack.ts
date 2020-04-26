import { DaySpecialAttackType } from "./DaySpecialAttackType"
import { fhDefinitions } from "../../FhDefinitions"
import { AirControlState } from "../../common"
import RateMap from "../RateMap"

type DaySpecialAttackDefinition = {
  priority: number
  baseRate: number
  power: number
  accuracy: number
}

export type DaySpecialAttackDefinitions = Record<DaySpecialAttackType, DaySpecialAttackDefinition>

type DaySpecialAttack = {
  type: DaySpecialAttackType
} & DaySpecialAttackDefinition

export const calcObservationTerm = ({
  luck,
  equipmentLos,
  isFlagship,
  airControlState,
  fleetLosModifier,
}: {
  luck: number
  equipmentLos: number
  isFlagship: boolean
  airControlState: AirControlState
  fleetLosModifier: number
}) => {
  const luckFactor = Math.floor(Math.sqrt(luck) + 10)
  const flagshipModifier = isFlagship ? 15 : 0

  if (airControlState === AirControlState.AirSupremacy) {
    return Math.floor(luckFactor + 0.7 * (fleetLosModifier + 1.6 * equipmentLos) + 10) + flagshipModifier
  }
  if (airControlState === AirControlState.AirSuperiority) {
    return Math.floor(luckFactor + 0.6 * (fleetLosModifier + 1.2 * equipmentLos)) + flagshipModifier
  }

  return 0
}

export const createDaySpecialAttack = (type: DaySpecialAttackType): DaySpecialAttack => {
  const def = fhDefinitions.daySpecialAttacks[type]
  return { type, ...def }
}

export const createRateMap = (attacks: DaySpecialAttack[], observationTerm: number) => {
  const rateMap = new RateMap()

  attacks.forEach((attack) => {
    const attackRate = Math.min(observationTerm / attack.baseRate, 1)
    const effectiveRate = rateMap.complement * attackRate
    rateMap.set(attack, effectiveRate)
  })

  return rateMap
}
