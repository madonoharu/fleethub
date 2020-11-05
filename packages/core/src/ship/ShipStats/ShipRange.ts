import { Range, MaybeNumber } from "../types"

export class ShipRange implements Range {
  constructor(public naked: MaybeNumber, public equipment: number, public bonus: number) {}

  get displayed() {
    const { naked, equipment, bonus } = this
    return Math.max(naked || 0, equipment) + bonus
  }
}
