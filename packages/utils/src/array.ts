export const uniq = <T>(array: T[]) => [...new Set(array)]

export const sumBy = <T>(array: T[], iteratee: (item: T) => number) =>
  array.reduce((total, item) => total + iteratee(item), 0)

export const includes = <T>(array: readonly T[], value: unknown): value is T => (array as unknown[]).includes(value)
