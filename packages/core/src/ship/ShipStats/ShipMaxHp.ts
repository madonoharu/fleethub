import { MaxHp, StatBase } from "../types"

const getMarriageBonus = (left: number) => {
  if (left >= 90) return 9
  if (left >= 70) return 8
  if (left >= 50) return 7
  if (left >= 40) return 6
  if (left >= 30) return 5
  return 4
}

export class ShipMaxHp implements MaxHp {
  private left: number
  private right: number
  constructor([left, right]: StatBase, public increase = 0, private isMarried: boolean) {
    this.left = left
    this.right = right
  }

  get displayed() {
    const { left, right, increase, isMarried } = this
    let displayed = left + increase

    if (isMarried) {
      displayed += getMarriageBonus(left)
    }

    return Math.min(displayed, right)
  }
}
