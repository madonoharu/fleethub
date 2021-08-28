import { Gear } from "@fleethub/core";
import { uniq } from "@fleethub/utils";

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

export const getFilter = (name: string): GearFilterFn => {
  if (name === "All") return () => true;

  return (g) => g.discern() === name;
};

export const getVisibleGroups = (gears: Gear[]): string[] => {
  const groups = uniq(gears.map((g) => g.discern()));

  return BASIC_FILTER_NAMES.filter(
    (name) => name === "All" || groups.includes(name)
  );
};
