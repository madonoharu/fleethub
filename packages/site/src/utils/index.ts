import { shallowEqual, deepEqual } from "fast-equals";
import { Draft } from "immer";
import { createSelectorCreator, defaultMemoize } from "reselect";

export type Recipe<T> = (draft: Draft<T>) => void;
export type Update<T> = (recipe: Recipe<T>) => void;

export const withSign = (num?: number) => {
  if (!num) return "";
  return num > 0 ? `+${num}` : num.toString();
};

export const toPercent = (value: number | null, fractionDigits = 1) => {
  if (value == null || Number.isNaN(value)) return "?";
  return (value * 100).toFixed(fractionDigits) + "%";
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
