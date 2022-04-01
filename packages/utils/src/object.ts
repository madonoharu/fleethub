export function mapValues<T, R>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => R
): Record<keyof T, R> {
  const nextObj = {} as Record<keyof T, R>;

  for (const key in obj) {
    const value = obj[key];
    nextObj[key] = fn(value, key);
  }

  return nextObj;
}

export function pick<T, K extends keyof T>(
  obj: T,
  keys: readonly K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;

  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });

  return result;
}

export async function promiseAllValues<K extends string, V>(
  obj: Record<K, Promise<V>>
): Promise<Record<K, V>> {
  const promises = Object.entries<Promise<V>>(obj).map(([k, p]) =>
    p.then((v) => [k, v] as const)
  );

  return Object.fromEntries(await Promise.all(promises)) as Record<K, V>;
}
