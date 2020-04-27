export type ShipFuel = {
  max: number
  current: number
  penalty: number
}

export class ShipFuelImpl implements ShipFuel {
  constructor(public readonly max = 0, public current = max) {}

  get penalty() {
    const { max, current } = this
    if (max <= 0) return 1

    const rate = current / max
    if (rate >= 0.75) return 1

    return 0.75 - rate
  }
}
