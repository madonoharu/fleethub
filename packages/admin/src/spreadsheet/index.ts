import { MasterData } from "fleethub-core";
import { Start2 } from "kc-tools";

import { createConfig } from "./config";
import { createEquippability } from "./equippability";
import { createGearData } from "./gear";
import { ExprParser } from "./parser";
import { SheetKey } from "./sheet";
import { createShipData } from "./ship";
import { SpreadsheetTable } from "./utils";

export function createMasterData(
  start2: Start2,
  ctype: string[],
  tables: Record<Exclude<SheetKey, "ship_classes">, SpreadsheetTable>
): MasterData {
  const parser = new ExprParser(start2, ctype);
  const shipData = createShipData(parser, tables);
  const gearData = createGearData(parser, tables);
  const equippable = createEquippability(parser, tables.equippability);
  const config = createConfig(tables);

  return {
    created_at: Date.now(),
    ...shipData,
    ...gearData,
    ...config,
    equippable,
  };
}

export { MasterDataSpreadsheet } from "./sheet";
