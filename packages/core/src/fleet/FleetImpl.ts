import { isNonNullable, atLeastOne } from "@fleethub/utils"
import { sumBy } from "lodash-es"

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

  get nightContactRate() {
    const probs: number[] = []

    this.ships.forEach((ship) =>
      ship.equipment.forEach((gear, key, slotSize) => {
        if (!slotSize || !gear.is("NightRecon")) return
        const prob = Math.floor(Math.sqrt(gear.los) * Math.sqrt(ship.level)) / 25
        probs.push(prob)
      })
    )

    return atLeastOne(probs)
  }

  public calcFighterPower = (lb?: boolean) => {
    return this.sumBy((ship) => ship.equipment.calcFighterPower(lb))
  }
}
