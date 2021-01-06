import { exec } from "child_process"
import { Luck, StatInterval, MaybeNumber } from "../types"

export class ShipLuck implements Luck {
  private left: MaybeNumber
  private right: MaybeNumber
  public value: number

  constructor([left, right]: StatInterval, public diff = 0) {
    this.left = left
    this.right = right

    if (left === null) {
      this.value = diff || NaN
    } else {
      this.value = left + diff
    }
  }
}
