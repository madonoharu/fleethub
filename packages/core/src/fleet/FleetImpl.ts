import { sumBy, isNonNullable, atLeastOne } from "@fleethub/utils"

import { Ship } from "../ship"

import { FleetState, Fleet } from "./types"
import { calcShipTp } from "./transportPoint"
import { calcExpeditionBonus } from "./expedition"

const calcShipAviationDetectionScore = ({ equipment }: Ship) =>
  equipment.sumBy((gear, index, slotSize) => {
    if (!slotSize) return 0

    if (gear.categoryIn("LargeFlyingBoat")) {
      return gear.los * Math.sqrt(slotSize)
    }

    if (gear.categoryIn("ReconSeaplane", "SeaplaneBomber")) {
      return gear.los * Math.sqrt(Math.sqrt(slotSize))
    }

    return 0
  })

export class FleetImpl implements Fleet {
  constructor(public state: FleetState, public entries: Fleet["entries"]) {}

  get ships() {
    return this.entries.map(([key, ship]) => ship).filter(isNonNullable)
  }

  public sumBy = (callbackFn: (ship: Ship) => number) => sumBy(this.ships, callbackFn)

  get fleetLosModifier() {
    const base = this.sumBy((ship) => ship.fleetLosFactor)
    return Math.floor(Math.sqrt(base) + 0.1 * base)
  }

  get aviationDetectionScore() {
    return this.sumBy(calcShipAviationDetectionScore)
  }

  get transportPoint() {
    return this.sumBy(calcShipTp)
  }

  get expeditionBonus() {
    return calcExpeditionBonus(this.ships)
  }

  get nightContactChance() {
    const rank1Probs: number[] = []
    const rank2Probs: number[] = []
    const rank3Probs: number[] = []

    this.ships.forEach((ship) =>
      ship.equipment.forEach((gear, key, slotSize) => {
        if (!slotSize || !gear.is("NightRecon")) return

        const { los, accuracy } = gear
        const prob = Math.floor(Math.sqrt(los) * Math.sqrt(ship.level)) / 25

        if (accuracy >= 3) rank1Probs.push(prob)
        else if (accuracy === 2) rank2Probs.push(prob)
        else rank3Probs.push(prob)
      })
    )

    const rank1SelectionProb = atLeastOne(rank1Probs)
    const rank2SelectionProb = atLeastOne(rank2Probs)
    const rank3SelectionProb = atLeastOne(rank3Probs)

    const rank1 = rank1SelectionProb
    const rank2 = (1 - rank1SelectionProb) * rank2SelectionProb
    const rank3 = (1 - rank1SelectionProb) * (1 - rank2SelectionProb) * rank3SelectionProb

    return { rank1, rank2, rank3 }
  }

  public calcFighterPower = (lb?: boolean) => {
    return this.sumBy((ship) => ship.equipment.calcFighterPower(lb))
  }
}
