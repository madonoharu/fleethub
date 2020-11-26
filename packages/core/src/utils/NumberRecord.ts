import { uniq } from "@fleethub/utils"

export type NumberRecordJson<K extends string | number> = Partial<Record<K, number>>

export default class NumberRecord<K extends string | number> {
  #data: NumberRecordJson<K>

  static count = <K extends string | number>(array: K[]) => {
    const counts = new NumberRecord<K>()

    array.forEach((item) => {
      counts.mutableSet(item, counts.get(item) + 1)
    })

    return counts
  }

  /** Relative Frequency Distribution */
  static rfd = <K extends string | number>(array: K[]) => NumberRecord.count(array).scale(1 / array.length)

  constructor(data: Partial<Record<K, number>> = {}) {
    this.#data = { ...data }
  }

  public keys() {
    return Object.keys(this.#data) as K[]
  }

  public values() {
    return Object.values(this.#data)
  }

  public get(key: K) {
    return (this.#data[key] || 0) as number
  }

  private mutableSet(key: K, value: number) {
    if (value === 0) {
      delete this.#data[key]
    } else {
      this.#data[key] = value
    }
  }

  public set(key: K, value: number) {
    return new NumberRecord<K>(this.#data).mutableSet(key, value)
  }

  public sum() {
    return this.keys().reduce((value, key) => value + this.get(key), 0)
  }

  public map(fn: (value: number, key: K) => number) {
    const next = new NumberRecord<K>()

    this.keys().forEach((key) => {
      next.mutableSet(key, fn(this.get(key), key))
    })

    return next
  }

  public add(data: NumberRecord<K> | NumberRecordJson<K>): NumberRecord<K> {
    const result = new NumberRecord<K>()

    let record: NumberRecord<K>
    if (data instanceof NumberRecord) {
      record = data
    } else {
      record = new NumberRecord(data)
    }

    const keys = uniq([...this.keys(), ...record.keys()])

    keys.forEach((key) => {
      const value = this.get(key) + record.get(key)
      result.mutableSet(key, value)
    })

    return result
  }

  public scale(multiplier: number) {
    return this.map((value) => value * multiplier)
  }
}
