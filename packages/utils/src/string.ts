export const isString = (value: unknown): value is string => typeof value === "string"

export const capitalize = <T extends string>(str: T) => (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>

export const uncapitalize = <T extends string>(str: T) =>
  (str.charAt(0).toLowerCase() + str.slice(1)) as Uncapitalize<T>
