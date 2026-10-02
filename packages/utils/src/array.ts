import { groupBy as groupByKey } from "es-toolkit";

export { uniq, uniqBy, sumBy } from "es-toolkit";

export function includes<T>(array: readonly T[], value: unknown): value is T {
  return (array as unknown[]).includes(value);
}

export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  iteratee: (value: T) => K,
): Partial<Record<K, T[]>> {
  return groupByKey(array, iteratee);
}
