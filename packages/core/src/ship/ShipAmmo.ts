export type ShipAmmo = {
  max: number
  current: number
  penalty: number
}

export class ShipAmmoImpl implements ShipAmmo {
  constructor(public readonly max = 0, public current = max) {}

  get penalty() {
    const { max, current } = this
    if (max <= 0) return 1

    const rate = current / max
    return Math.min(2 * rate, 1)
  }
}
