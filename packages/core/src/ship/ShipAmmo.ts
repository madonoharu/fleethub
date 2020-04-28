import { Ammo } from "./types"

export class ShipAmmo implements Ammo {
  constructor(public readonly max = 0, public current = max) {}

  get penalty() {
    const { max, current } = this
    if (max <= 0) return 1

    const percent = Math.floor((current / max) * 100)
    return Math.min(percent / 50, 1)
  }
}
