import { MaybeNumber } from "@fleethub/utils"
import { MaxHp, StatInterval } from "../types"

const getMarriageBonus = (left: number) => {
  if (left >= 90) return 9
  if (left >= 70) return 8
  if (left >= 50) return 7
  if (left >= 40) return 6
  if (left >= 30) return 5
  return 4
}

export class ShipMaxHp implements MaxHp {
  private left: MaybeNumber
  private right: MaybeNumber

  constructor([left, right]: StatInterval, public diff = 0, private isMarried: boolean) {
    this.left = left ?? NaN
    this.right = right ?? NaN
  }

  get limit() {
    const { left, right } = this

    if (left === null || right === null) {
      return 0
    }

    return Math.min(right, getMarriageBonus(left) + 2)
  }

  get displayed() {
    const { left, right, diff, isMarried } = this

    if (left === null || right === null) {
      return diff
    }

    let displayed = left + diff

    if (isMarried) {
      displayed += getMarriageBonus(left)
    }

    return Math.min(displayed, right)
  }
}
