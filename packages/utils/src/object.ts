export const mapValues = <T, R>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => R
) => {
  const nextObj = {} as Record<keyof T, R>;

  for (const key in obj) {
    const value = obj[key];
    nextObj[key] = fn(value, key);
  }

  return nextObj;
};

export const pick = <T, K extends keyof T>(
  obj: T,
  keys: readonly K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;

  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });

  return result;
};

export const cloneJson = <T>(json: T): T =>
  JSON.parse(JSON.stringify(json)) as T;
