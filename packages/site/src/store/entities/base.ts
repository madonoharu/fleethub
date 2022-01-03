import { AttackPowerModifiers, NightSituation } from "fleethub-core";

import { createOrmAdapters } from "./createOrmAdapters";
import { schemata, StepConfig } from "./schemata";

export const ormAdapters = createOrmAdapters(...schemata);

export const ENTITIES_SLICE_NAME = "orm";

export function getSliceName<K extends string>(
  key: K
): `${typeof ENTITIES_SLICE_NAME}/${K}` {
  return `${ENTITIES_SLICE_NAME}/${key}`;
}

export const initalNightSituation: NightSituation = {
  night_contact_rank: null,
  searchlight: false,
  starshell: false,
};

export const initalAttackPowerModifiers: AttackPowerModifiers = {
  a11: 1,
  a12: 1,
  a13: 1,
  a13_2: 1,
  a14: 1,
  a5: 1,
  a6: 1,
  a7: 1,
  b11: 0,
  b12: 0,
  b13: 0,
  b13_2: 0,
  b14: 0,
  b5: 0,
  b6: 0,
  b7: 0,
};

export const initalStepConfig: StepConfig = {
  air_state: "AirSupremacy",
  engagement: "Parallel",
  player: {
    formation: "LineAhead",
    night_situation: initalNightSituation,
    external_power_mods: initalAttackPowerModifiers,
  },
  enemy: {
    formation: "LineAhead",
    night_situation: initalNightSituation,
    external_power_mods: initalAttackPowerModifiers,
  },
};
