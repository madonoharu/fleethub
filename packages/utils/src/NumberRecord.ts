import { uniq } from "./array";

type NumberDict<K> = K extends string ? Partial<Record<K, number>> : never;

export default class NumberRecord<K> {
  #mut = false;
  #data: Map<K, number>;

  static count = <K>(array: K[]): NumberRecord<K> => {
    return new NumberRecord<K>().withMut((self) => {
      array.forEach((item) => {
        self.add(item, 1);
      });
    });
  };

  /** Relative Frequency Distribution */
  static rfd = <K>(array: K[]): NumberRecord<K> =>
    NumberRecord.count(array).multiply(1 / array.length);

  constructor(data?: NumberDict<K> | Map<K, number> | [K, number][]) {
    if (Array.isArray(data) || data instanceof Map) {
      data = new Map(data);
    } else {
      data = (new Map(Object.entries(data || {})) as unknown) as Map<K, number>;
    }

    this.#data = data;
  }

  public clone(): NumberRecord<K> {
    return new NumberRecord(this.#data);
  }

  private self(): NumberRecord<K> {
    return this.#mut ? this : this.clone();
  }

  public withMut(mutator: (self: NumberRecord<K>) => void): NumberRecord<K> {
    const self = this.self();
    const mut = self.#mut;

    self.#mut = true;
    mutator(self);
    self.#mut = mut;

    return self;
  }

  private put(key: K, value: number): this {
    this.#data.set(key, value);
    return this;
  }

  public keys(): K[] {
    return [...this.#data.keys()];
  }

  public values(): number[] {
    return [...this.#data.values()];
  }

  public toArray(): [K, number][] {
    return [...this.#data.entries()];
  }

  public get(key: K): number {
    return this.#data.get(key) || 0;
  }

  public set(key: K, value: number): NumberRecord<K> {
    return this.self().put(key, value);
  }

  public delete(key: K): NumberRecord<K> {
    const self = this.self();
    self.#data.delete(key);

    return self;
  }

  public forEach(fn: (value: number, key: K) => void): void {
    this.#data.forEach(fn);
  }

  public add(key: K, addend: number): NumberRecord<K>;
  public add(addend: NumberRecord<K>): NumberRecord<K>;
  public add(...args: [K, number] | [NumberRecord<K>]): NumberRecord<K> {
    const self = this.self();

    if (args.length === 2) {
      const [key, addend] = args;
      return self.set(key, self.get(key) + addend);
    }

    const addend = args[0];

    const keys = uniq([...self.keys(), ...addend.keys()]);

    return self.withMut((self) => {
      keys.forEach((key) => {
        self.add(key, addend.get(key));
      });
    });
  }

  public multiply(multiplier: number): NumberRecord<K> {
    const self = this.self();

    self.forEach((value, key) => {
      self.put(key, value * multiplier);
    });

    return self;
  }

  public map(fn: (value: number, key: K) => number): NumberRecord<K> {
    const cloned = this.clone();

    cloned.forEach((value, key) => {
      cloned.put(key, fn(value, key));
    });

    return cloned;
  }

  public filter(fn: (value: number, key: K) => boolean): NumberRecord<K> {
    const cloned = this.clone();

    return cloned.withMut((self) => {
      self.forEach((value, key) => {
        if (!fn(value, key)) self.delete(key);
      });
    });
  }

  public sum(): number {
    return this.keys().reduce((value, key) => value + this.get(key), 0);
  }

  public minBy(fn: (value: number, key: K) => number): [K, number] | undefined {
    let result: [K, number] | undefined;
    let min: number | undefined;

    this.forEach((value, key) => {
      const current = fn(value, key);

      if (min === undefined || current < min) {
        min = current;
        result = [key, value];
      }
    });

    return result;
  }

  public maxBy(fn: (value: number, key: K) => number): [K, number] | undefined {
    let result: [K, number] | undefined;
    let max: number | undefined;

    this.forEach((value, key) => {
      const current = fn(value, key);

      if (max === undefined || current > max) {
        max = current;
        result = [key, value];
      }
    });

    return result;
  }

  public toObject(): K extends string ? Partial<Record<K, number>> : never;
  public toObject<P extends string>(
    fn: (key: K, value: number) => P
  ): Partial<Record<P, number>>;
  public toObject(
    fn?: (key: K, value: number) => string
  ): Partial<Record<string, number>> {
    const result: Partial<Record<string, number>> = {};

    if (!fn) {
      this.forEach((value, key) => {
        if (typeof key === "string") {
          result[key] = value;
        }
      });
    } else {
      this.forEach((value, key) => {
        result[fn(key, value)] = value;
      });
    }

    return result;
  }
}
