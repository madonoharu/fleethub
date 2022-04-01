export function range(n: number): number[] {
  return [...Array(n).keys()];
}

export function nonNullable<T>(item: T): item is NonNullable<T> {
  return item !== undefined && item !== null;
}
