import { Fuel } from "../types"

export class ShipFuel implements Fuel {
  constructor(public readonly max = 0, public current = max) {}

  get penalty() {
    const { max, current } = this
    if (max <= 0) return 0

    const percent = Math.floor((current / max) * 100)
    if (percent >= 75) return 0
    return 75 - percent
  }
}
