import { SlotSizeKey, SLOT_SIZE_KEYS } from "@fh/utils";
import { EntityState, PayloadAction } from "@reduxjs/toolkit";
import { NightSituation } from "fleethub-core";

import { createOrmAdapters } from "./createOrmAdapters";
import { schemata, StepConfig } from "./schemata";

export const ormAdapters = createOrmAdapters(...schemata);

export const ENTITIES_SLICE_NAME = "entities";

export function getSliceName<K extends string>(
  key: K
): `${typeof ENTITIES_SLICE_NAME}/${K}` {
  return `${ENTITIES_SLICE_NAME}/${key}`;
}

export const initialNightSituation: NightSituation = {
  night_contact_rank: null,
  searchlight: false,
  starshell: false,
};

export const initialStepConfig: StepConfig = {
  air_state: "AirSupremacy",
  engagement: "Parallel",
  player: {
    formation: "LineAhead",
    night_situation: initialNightSituation,
  },
  enemy: {
    formation: "LineAhead",
    night_situation: initialNightSituation,
  },
};

export function resetSlotSize(
  state: EntityState<Partial<Record<SlotSizeKey, number>>>,
  { payload }: PayloadAction<string[]>
) {
  payload
    .map((id) => state.entities[id])
    .forEach((entity) => {
      if (entity) {
        SLOT_SIZE_KEYS.forEach((key) => {
          delete entity[key];
        });
      }
    });
}
