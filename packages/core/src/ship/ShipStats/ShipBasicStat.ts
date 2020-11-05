import { StatInterval, BasicStat } from "../types"

export class ShipBasicStat implements BasicStat {
  public left: number
  public right: number

  constructor([left, right]: StatInterval, public equipment: number, public increase = 0, public bonus = 0) {
    this.left = left ?? NaN
    this.right = right ?? NaN
  }

  get naked() {
    const { right, increase } = this
    return (right || 0) + increase
  }

  get displayed() {
    const { naked, equipment, bonus } = this
    return naked + equipment + bonus
  }
}

export class ShipBasicStatWithLevel extends ShipBasicStat {
  constructor(private level: number, ...args: ConstructorParameters<typeof ShipBasicStat>) {
    super(...args)
  }

  get naked() {
    const { left: at1, right: at99, level, increase } = this
    if (!Number.isFinite(at1) || !Number.isFinite(at99)) return increase

    return Math.floor(((at99 - at1) * level) / 99 + at1) + increase
  }
}
