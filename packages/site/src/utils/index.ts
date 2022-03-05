import { round } from "@fh/utils";
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
  return round(v, fractionDigits).toString();
};

export const toPercent = (v: number | null | undefined, fractionDigits = 1) => {
  if (v == null || v === undefined || Number.isNaN(v)) return "?%";
  return (v * 100).toFixed(fractionDigits) + "%";
};

export const getSpeedLabel = (v: number | undefined) => {
  if (v === undefined || v < 0) return "?";
  if (v === 0) return "SpeedLand";
  if (v <= 5) return "SpeedSlow";
  if (v <= 10) return "SpeedFast";
  if (v <= 15) return "SpeedFaster";
  return "SpeedFastest";
};

export const getRangeLabel = (v: number | undefined) => {
  if (!v || v <= 0) return "?";
  if (v === 1) return "RangeShortAbbr";
  if (v === 2) return "RangeMediumAbbr";
  if (v === 3) return "RangeLongAbbr";
  if (v === 4) return "RangeVeryLongAbbr";
  return "RangeExtremeLongAbbr";
};

export const createShallowEqualSelector = createSelectorCreator(
  defaultMemoize,
  shallowEqual
);

export const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  deepEqual
);

export function measure<R>(label: string, fn: () => R): R {
  const t0 = performance.now();
  const r = fn();
  const t1 = performance.now();
  console.log(`${label}: ${(t1 - t0).toFixed(4)}ms`);
  return r;
}

export { default as batch } from "./batch";
export * from "./cloudinary";
export * from "./ebonuses";
export * from "./link";
export * from "./publish";
export * from "./deck";
export * from "./gkcoi";
export * from "./jor";
export * from "./compress";
