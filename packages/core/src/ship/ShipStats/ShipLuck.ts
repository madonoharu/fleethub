import { Luck, StatBase } from "../types"

export class ShipLuck implements Luck {
  private left: number
  private right: number
  constructor([left, right]: StatBase, public increase = 0) {
    this.left = left
    this.right = right
  }

  public get displayed() {
    const { left, right, increase } = this
    return left + increase
  }
}
