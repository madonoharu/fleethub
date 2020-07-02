export class RateMap<Key> extends Map<Key, number> {
  constructor() {
    super()
  }

  get total() {
    let total = 0
    for (const value of this.values()) {
      total += value
    }
    return total
  }

  get complement() {
    return 1 - this.total
  }
}
