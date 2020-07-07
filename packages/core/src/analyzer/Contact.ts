import { Dict, atLeastOne } from "@fleethub/utils"

import { AirState } from "../common"
import { Ship } from "../ship"

export type ContactChance = {
  airState: AirState
  trigger: number
  rank1: number
  rank2: number
  rank3: number
  total: number
}

const AirStateModifiers: Dict<AirState, number> = {
  AirSupremacy: 3,
  AirSuperiority: 2,
  AirDenial: 1,
}
const getAirStateModifier = (airState: AirState) => AirStateModifiers[airState] || 0

const calcTriggerChance = (ships: Ship[], airStateModifier: number) => {
  if (airStateModifier === 0) return 0

  let totalTriggerFactor = 0
  ships.forEach((ship) => {
    totalTriggerFactor += ship.equipment.sumBy((gear, key, slotSize) => {
      if (!slotSize) return 0
      return gear.calcContactTriggerFactor(slotSize)
    })
  })

  return Math.min((totalTriggerFactor + 1) / (70 - 15 * airStateModifier), 1)
}

export const calcContactChance = (ships: Ship[], airState: AirState) => {
  const airStateModifier = getAirStateModifier(airState)
  const trigger = calcTriggerChance(ships, airStateModifier)

  const rank1SelectionProbs: number[] = []
  const rank2SelectionProbs: number[] = []
  const rank3SelectionProbs: number[] = []

  ships.forEach((ship) =>
    ship.equipment.forEach((gear, key, slotSize) => {
      if (!slotSize) return

      const prob = gear.calcContactSelectionChance(airStateModifier)

      if (!prob) return

      const { accuracy } = gear
      if (accuracy >= 3) rank1SelectionProbs.push(prob)
      else if (accuracy === 2) rank2SelectionProbs.push(prob)
      else rank3SelectionProbs.push(prob)
    })
  )

  const rank1SelectionProb = atLeastOne(rank1SelectionProbs)
  const rank2SelectionProb = atLeastOne(rank2SelectionProbs)
  const rank3SelectionProb = atLeastOne(rank3SelectionProbs)

  const rank1 = trigger * rank1SelectionProb
  const rank2 = trigger * (1 - rank1SelectionProb) * rank2SelectionProb
  const rank3 = trigger * (1 - rank1SelectionProb) * (1 - rank2SelectionProb) * rank3SelectionProb
  const total = rank1 + rank2 + rank3

  return { airState, trigger, rank1, rank2, rank3, total }
}
