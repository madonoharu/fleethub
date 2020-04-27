export type ShipFuel = {
  max: number
  current: number
  /** 0~75の整数 */
  penalty: number
}

export class ShipFuelImpl implements ShipFuel {
  constructor(public readonly max = 0, public current = max) {}

  get penalty() {
    const { max, current } = this
    if (max <= 0) return 0

    const percent = Math.floor((current / max) * 100)
    if (percent >= 75) return 0
    return 75 - percent
  }
}
