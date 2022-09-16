import { MasterData } from "fleethub-core";
import { Start2 } from "kc-tools";

import { createBattleDefinitions } from "./createBattleDefinitions";
import { createEquippability } from "./equippability";
import { createGearData } from "./gear";
import { NationalityMap } from "./nationality";
import { ExprParser } from "./parser";
import { SheetKey } from "./sheet";
import { createShipData } from "./ship";
import { SpreadsheetTable } from "./utils";

export function createMasterData(
  start2: Start2,
  ctypeNames: string[],
  tables: Record<Exclude<SheetKey, "ship_classes">, SpreadsheetTable>
): MasterData {
  const nationalityMap = new NationalityMap(tables.nationalities);
  const parser = new ExprParser(start2, ctypeNames, nationalityMap);

  const shipData = createShipData(parser, tables);
  const gearData = createGearData(parser, tables);
  const defs = createBattleDefinitions(parser, tables);
  const equippability = createEquippability(parser, tables.equippability);

  return {
    created_at: Date.now(),
    ...shipData,
    ...gearData,
    ...defs,
    equippability,
  };
}

export { MasterDataSpreadsheet } from "./sheet";
