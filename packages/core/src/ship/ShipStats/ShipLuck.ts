import { exec } from "child_process"
import { Luck, StatInterval, MaybeNumber } from "../types"

export class ShipLuck implements Luck {
  private left: MaybeNumber
  private right: MaybeNumber
  public displayed: number

  constructor([left, right]: StatInterval, public diff = 0) {
    this.left = left
    this.right = right

    if (left === null) {
      this.displayed = diff || NaN
    } else {
      this.displayed = left + diff
    }
  }
}
