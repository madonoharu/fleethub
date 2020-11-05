import { exec } from "child_process"
import { Luck, StatInterval, MaybeNumber } from "../types"

export class ShipLuck implements Luck {
  private left: MaybeNumber
  private right: MaybeNumber
  public displayed: number

  constructor([left, right]: StatInterval, public increase = 0) {
    this.left = left
    this.right = right

    if (left === null) {
      this.displayed = increase || NaN
    } else {
      this.displayed = left + increase
    }
  }
}
