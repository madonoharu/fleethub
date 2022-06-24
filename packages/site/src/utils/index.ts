import { round } from "@fh/utils";
import { shallowEqual, deepEqual } from "fast-equals";
import { Draft } from "immer";
import { createSelectorCreator, defaultMemoize } from "reselect";

export type Recipe<T> = (draft: Draft<T>) => void;
export type Update<T> = (recipe: Recipe<T>) => void;

export function withSign(num?: number): string {
  if (num === undefined) {
    return "";
  } else {
    return num > 0 ? `+${num}` : num.toString();
  }
}

export function numstr(v: number | null | undefined, precision = 3): string {
  if (v === null || v === undefined) {
    return "";
  } else if (Number.isInteger(v)) {
    return v.toString();
  } else {
    return round(v, precision).toString();
  }
}

export function toPercent(v: number | null | undefined, precision = 1): string {
  if (v == null || v === undefined || Number.isNaN(v)) {
    return "?%";
  } else {
    return (v * 100).toFixed(precision) + "%";
  }
}

export function getSpeedRank(v: number | undefined | null) {
  if (typeof v !== "number" || v < 0) return undefined;
  if (v === 0) return "Land";
  if (v <= 5) return "Slow";
  if (v <= 10) return "Fast";
  if (v <= 15) return "Faster";
  return "Fastest";
}

export function getRangeAbbr(v: number | undefined | null) {
  if (!v || v <= 0) return undefined;
  if (v === 1) return "Short";
  if (v === 2) return "Medium";
  if (v === 3) return "Long";
  if (v === 4) return "VeryLong";
  return "ExtremeLong";
}

export const createShallowEqualSelector = createSelectorCreator(
  defaultMemoize,
  shallowEqual
);

export const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  deepEqual
);

export * from "./cloudinary";
export * from "./ebonuses";
export * from "./link";
export * from "./publish";
export * from "./deck";
export * from "./gkcoi";
export * from "./jor";
