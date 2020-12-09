import { uniq } from "./array"

type NumberDict<K> = K extends string ? Partial<Record<K, number>> : never

export default class NumberRecord<K> {
  #data: Map<K, number>

  static count = <K>(array: K[]): NumberRecord<K> => {
    const counts = new NumberRecord<K>()

    array.forEach((item) => {
      counts.insert(item, counts.get(item) + 1)
    })

    return counts
  }

  /** Relative Frequency Distribution */
  static rfd = <K>(array: K[]): NumberRecord<K> => NumberRecord.count(array).scale(1 / array.length)

  constructor(data?: NumberDict<K> | Map<K, number> | [K, number][]) {
    if (Array.isArray(data) || data instanceof Map) {
      data = new Map(data)
    } else {
      data = (new Map(Object.entries(data || {})) as unknown) as Map<K, number>
    }

    this.#data = data
  }

  public insert(key: K, value: number): NumberRecord<K> {
    if (value === 0) {
      this.#data.delete(key)
    } else {
      this.#data.set(key, value)
    }

    return this
  }

  public keys(): K[] {
    return [...this.#data.keys()]
  }

  public values(): number[] {
    return [...this.#data.values()]
  }

  public get(key: K): number {
    return this.#data.get(key) || 0
  }

  public set(key: K, value: number): NumberRecord<K> {
    return new NumberRecord<K>(this.#data).insert(key, value)
  }

  public sum(): number {
    return this.keys().reduce((value, key) => value + this.get(key), 0)
  }

  public map(fn: (value: number, key: K) => number): NumberRecord<K> {
    const next = new NumberRecord<K>()

    this.keys().forEach((key) => {
      next.insert(key, fn(this.get(key), key))
    })

    return next
  }

  public update(key: K, fn: (value: number, key: K) => number): NumberRecord<K> {
    const value = this.get(key)
    return this.set(key, fn(value, key))
  }

  public add(record: NumberRecord<K>): NumberRecord<K> {
    const result = new NumberRecord<K>()

    const keys = uniq([...this.keys(), ...record.keys()])

    keys.forEach((key) => {
      const value = this.get(key) + record.get(key)
      result.insert(key, value)
    })

    return result
  }

  public scale(multiplier: number): NumberRecord<K> {
    return this.map((value) => value * multiplier)
  }

  public toArray(): [K, number][] {
    return [...this.#data.entries()]
  }
}
