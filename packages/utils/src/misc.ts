export const range = (n: number) => [...Array(n).keys()];

export const nonNullable = <T>(item: T): item is NonNullable<T> =>
  item !== undefined && item !== null;
