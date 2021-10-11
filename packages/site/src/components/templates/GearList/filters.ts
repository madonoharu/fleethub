import { Gear, GearCategory } from "@fh/core";
import { uniq } from "@fh/utils";

export type GearFilterFn = (gear: Gear) => boolean;

const BASIC_FILTER_NAMES = [
  "All",
  "Fighter",
  "Bomber",
  "Recon",
  "MainGun",
  "Secondary",
  "Torpedo",
  "AntiSub",
  "Radar",
  "Landing",
  "Ration",
  "LandBased",
  "Misc",
] as const;

export const getVisibleCategories = (
  gears: Gear[]
): (GearCategory | "All")[] => {
  const categories = uniq(gears.map((g) => g.category()));

  return BASIC_FILTER_NAMES.filter(
    (name) => name === "All" || categories.includes(name)
  );
};

export const getFilter = (name: GearCategory | "All"): GearFilterFn => {
  if (name === "All") return () => true;

  return (g) => g.category() === name;
};
