import { Speed } from "../types"

export class ShipSpeed implements Speed {
  constructor(public naked: number, public bonus: number) {}

  get displayed() {
    return this.naked + this.bonus
  }
}
