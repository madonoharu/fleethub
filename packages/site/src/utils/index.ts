import { shallowEqual, deepEqual } from "fast-equals";
import { Draft } from "immer";
import { createSelectorCreator, defaultMemoize } from "reselect";

export type Recipe<T> = (draft: Draft<T>) => void;
export type Update<T> = (recipe: Recipe<T>) => void;

export const withSign = (num?: number) => {
  if (!num) return "";
  return num > 0 ? `+${num}` : num.toString();
};

export const numstr = (
  v: number | null | undefined,
  fractionDigits = 3
): string => {
  if (v === null || v === undefined) return "";
  if (Number.isInteger(v)) return v.toString();
  return v.toFixed(fractionDigits);
};

export const toPercent = (v: number | null | undefined, fractionDigits = 1) => {
  if (v == null || v === undefined || Number.isNaN(v)) return "?%";
  return (v * 100).toFixed(fractionDigits) + "%";
};

export const createShallowEqualSelector = createSelectorCreator(
  defaultMemoize,
  shallowEqual
);

export const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  deepEqual
);

export { default as batch } from "./batch";
export * from "./cloudinary";
export * from "./ebonuses";
export * from "./FhDictionary";
export * from "./link";
export * from "./publish";
export * from "./deck";
export * from "./gkcoi";
