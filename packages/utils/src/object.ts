export const mapValues = <T, R>(obj: T, fn: (value: T[keyof T], key: keyof T) => R) => {
  const nextObj = {} as Record<keyof T, R>

  for (const key in obj) {
    const value = obj[key]
    nextObj[key] = fn(value, key)
  }

  return nextObj
}

export const cloneJson = <T>(json: T): T => JSON.parse(JSON.stringify(json))
