export function uniq<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function uniqBy<T>(array: T[], iteratee: (value: T) => unknown): T[] {
  const state = new Set();

  return array.filter((item) => {
    const v = iteratee(item);

    if (state.has(v)) {
      return false;
    }

    state.add(v);
    return true;
  });
}

export function sumBy<T>(array: T[], iteratee: (item: T) => number) {
  return array.reduce((total, item) => total + iteratee(item), 0);
}

export function includes<T>(array: readonly T[], value: unknown): value is T {
  return (array as unknown[]).includes(value);
}

export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  iteratee: (value: T) => K
): Partial<Record<K, T[]>> {
  const result = {} as Record<K, T[]>;

  array.forEach((value) => {
    const key = iteratee(value);

    if (key in result) {
      result[key].push(value);
    } else {
      result[key] = [value];
    }
  });

  return result;
}
