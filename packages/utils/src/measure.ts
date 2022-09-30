import { isPromise } from "util/types";

export function measure<R>(label: string, fn: () => R): R {
  const t0 = performance.now();
  const r = fn();

  if (isPromise(r)) {
    return r.finally(() => {
      const t1 = performance.now();
      console.log(`${label}: ${(t1 - t0).toFixed(4)}ms`);
    }) as R;
  }

  const t1 = performance.now();
  console.log(`${label}: ${(t1 - t0).toFixed(4)}ms`);
  return r;
}
