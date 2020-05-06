import { sumBy } from "lodash-es"

import { NullableArray, isNonNullable } from "../utils"
import { Ship } from "../ship"

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

type Fleet = {
  fleetLosModifier: number
  aviationDetectionScore: number
  transportPoint: number
  expeditionBonus: number
}

export class FleetImpl implements Fleet {
  constructor(public ships: NullableArray<Ship>) {}

  public sumBy = (callbackFn: (ship: Ship) => number) => sumBy(this.ships.filter(isNonNullable), callbackFn)

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
    return calcExpeditionBonus(this.ships.filter(isNonNullable))
  }
}
