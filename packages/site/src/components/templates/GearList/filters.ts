import { Gear } from "@fleethub/core";
import { uniq } from "@fleethub/utils";
import { pascalCase } from "literal-case";

export type GearFilterFn = (gear: Gear) => boolean;

const BASIC_FILTER_NAMES = [
  "all",
  "fighter",
  "bomber",
  "recon",
  "mainGun",
  "secondary",
  "torpedo",
  "antiSub",
  "radar",
  "landing",
  "ration",
  "landBased",
  "misc",
] as const;

export const getFilter = (name: string): GearFilterFn => {
  if (name === "all") return () => true;

  return (g) => g.discern().toLowerCase() === name.toLowerCase();
};

export const getVisibleGroups = (gears: Gear[]): string[] => {
  const groups = uniq(gears.map((g) => g.discern()));

  return BASIC_FILTER_NAMES.filter(
    (name) => name === "all" || groups.includes(pascalCase(name))
  );
};
