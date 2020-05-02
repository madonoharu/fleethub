import { Accuracy } from "../types"

export class ShipAccuracy implements Accuracy {
  constructor(public readonly equipment: number, public readonly bonus: number) {}

  get displayed() {
    const { equipment, bonus } = this
    return equipment + bonus
  }
}
