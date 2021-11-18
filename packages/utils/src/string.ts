export function uppercase<T extends string>(str: T): Uppercase<T> {
  return str.toUpperCase() as Uppercase<T>;
}

export function lowercase<T extends string>(str: T): Lowercase<T> {
  return str.toLowerCase() as Lowercase<T>;
}

export function capitalize<T extends string>(str: T): Capitalize<T> {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;
}

export function uncapitalize<T extends string>(str: T): Uncapitalize<T> {
  return (str.charAt(0).toLowerCase() + str.slice(1)) as Uncapitalize<T>;
}
