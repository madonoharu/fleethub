import { Gear, GearFilterGroup } from "@fh/core";
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

export const getFilter = (name: GearFilterGroup | "All"): GearFilterFn => {
  if (name === "All") return () => true;

  return (g) => g.filter_group() === name;
};

export const getVisibleGroups = (
  gears: Gear[]
): (GearFilterGroup | "All")[] => {
  const groups = uniq(gears.map((g) => g.filter_group()));

  return BASIC_FILTER_NAMES.filter(
    (name) => name === "All" || groups.includes(name)
  );
};
