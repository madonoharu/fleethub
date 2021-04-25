export const range = (n: number) => [...Array(n).keys()];

export const isNonNullable = <T>(item: T): item is NonNullable<T> =>
  item !== undefined && item !== null;
