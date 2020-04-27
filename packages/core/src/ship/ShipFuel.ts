export type ShipFuel = {
  max: number
  current: number
  penalty: number
}

export class ShipFuelImpl implements ShipFuel {
  public max = 0
  public current = 0

  get penalty() {
    const { max, current } = this
    if (max <= 0) return 1

    const rate = current / max
    if (rate >= 0.75) return 1

    return 0.75 - rate
  }
}
