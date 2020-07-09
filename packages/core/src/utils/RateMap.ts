export class RateMap<Key> extends Map<Key, number> {
  constructor() {
    super()
  }

  public sumBy(cb: (rate: number, key: Key) => number) {
    let result = 0

    this.forEach((rate, key) => {
      result += cb(rate, key)
    })

    return result
  }

  get total() {
    return this.sumBy((rate) => rate)
  }

  get complement() {
    return 1 - this.total
  }

  public toArray(): Array<[Key, number]>
  public toArray<R>(mapfn: (entry: [Key, number], index: number) => R): R[]
  public toArray<R>(mapfn?: (entry: [Key, number], index: number) => R) {
    return mapfn ? Array.from(this, mapfn) : Array.from(this)
  }

  public upsert(key: Key, cb: (old?: number) => number) {
    const old = this.get(key)
    this.set(key, cb(old))
  }
}
