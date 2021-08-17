import { Dict } from "./utilityTypes";

export const uniq = <T>(array: T[]) => [...new Set(array)];

export const uniqBy = <T>(array: T[], iteratee: (value: T) => unknown): T[] => {
  const state = new Set();

  return array.filter((item) => {
    const v = iteratee(item);

    if (state.has(v)) {
      return true;
    }

    state.add(v);
    return false;
  });
};

export const sumBy = <T>(array: T[], iteratee: (item: T) => number) =>
  array.reduce((total, item) => total + iteratee(item), 0);

export const includes = <T>(array: readonly T[], value: unknown): value is T =>
  (array as unknown[]).includes(value);

export const groupBy = <T, K extends string | number | symbol>(
  array: T[],
  iteratee: (value: T) => K
): Dict<K, T[]> => {
  return array.reduce<Dict<K, T[]>>((result, value) => {
    const key = iteratee(value);

    if (key in result) {
      result[key]?.push(value);
    } else {
      result[key] = [value];
    }

    return result;
  }, {});
};
