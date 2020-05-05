import { sumBy } from "lodash-es"

import { NullableArray, isNonNullable } from "../utils"
import { Ship } from "../ship"

type Fleet = {
  fleetLosModifier: number
}

export class FleetImpl implements Fleet {
  constructor(public ships: NullableArray<Ship>) {}

  get fleetLosModifier() {
    const base = sumBy(this.ships.filter(isNonNullable), (ship) => ship.fleetLosFactor)
    return Math.floor(Math.sqrt(base) + 0.1 * base)
  }
}
