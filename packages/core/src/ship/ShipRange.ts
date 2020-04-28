import { Range } from "./types"

export class ShipRange implements Range {
  constructor(public naked: number, public equipment: number, public bonus: number) {}

  get displayed() {
    const { naked, equipment, bonus } = this
    return Math.max(naked, equipment) + bonus
  }
}
