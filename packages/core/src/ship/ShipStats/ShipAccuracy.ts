import { Accuracy } from "../types"

export class ShipAccuracy implements Accuracy {
  constructor(public readonly equipment: number, public readonly bonus: number) {}

  get value() {
    const { equipment, bonus } = this
    return equipment + bonus
  }
}
