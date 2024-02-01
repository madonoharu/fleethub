import { SlotSizeKey, SLOT_SIZE_KEYS } from "@fh/utils";
import { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";

import { createOrmAdapters } from "./createOrmAdapters";
import { schemata } from "./schemata";

export const ormAdapters = createOrmAdapters(...schemata);

export const ENTITIES_SLICE_NAME = "entities";

export function getSliceName<K extends string>(
  key: K,
): `${typeof ENTITIES_SLICE_NAME}/${K}` {
  return `${ENTITIES_SLICE_NAME}/${key}`;
}

export function resetSlotSize(
  state: EntityState<Partial<Record<SlotSizeKey, number>>, EntityId>,
  { payload }: PayloadAction<string[]>,
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
