import { mergeWith } from "es-toolkit";
import type { MasterData } from "fleethub-core";
import { produce } from "immer";

import type { MasterDataOverrides } from "../store/configSlice";

function keepDefaultOnNull(current: unknown, override: unknown): unknown {
  return override === null ? current : undefined;
}

export function mergeMasterData(source: MasterData, overrides: MasterDataOverrides): MasterData {
  return produce(source, (draft) => {
    draft.ships.forEach((ship) => {
      const changes = overrides.ships?.[ship.ship_id];
      if (changes) mergeWith(ship, changes, keepDefaultOnNull);
    });
    draft.day_cutin.forEach((cutin) => {
      const changes = overrides.day_cutin?.[cutin.tag];
      if (changes) mergeWith(cutin, changes, keepDefaultOnNull);
    });
    draft.night_cutin.forEach((cutin) => {
      const changes = overrides.night_cutin?.[cutin.tag];
      if (changes) mergeWith(cutin, changes, keepDefaultOnNull);
    });
    draft.anti_air_cutin.forEach((cutin) => {
      const changes = overrides.anti_air_cutin?.[cutin.id];
      if (changes) mergeWith(cutin, changes, keepDefaultOnNull);
    });
  });
}
