import type { HistoricalBonusDef, MasterShip } from "fleethub-core";

import { convertKc3BonusFiles } from "./convert";
import { Kc3BonusFile } from "./kc3";
import { LEGACY_HISTORICAL_BONUSES } from "./legacy";

export * from "./kc3";
export { convertKc3BonusFiles } from "./convert";
export { LEGACY_HISTORICAL_BONUSES } from "./legacy";

/**
 * KC3Kai/kancolle-replay の特効データと、そこに含まれない海域の固定データを結合する。
 */
export function createHistoricalBonusDefs(
  files: Kc3BonusFile[],
  ships: MasterShip[],
): HistoricalBonusDef[] {
  const converted = convertKc3BonusFiles(files, ships);
  const covered = new Set(converted.map((def) => def.map));
  const legacy = LEGACY_HISTORICAL_BONUSES.filter((def) => !covered.has(def.map));

  return [...legacy, ...converted].sort((a, b) => (a.map ?? 0) - (b.map ?? 0));
}
