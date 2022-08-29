import { MasterData, MasterEquippable } from "fleethub-core";
import { Start2 } from "kc-tools";

import { createConfig } from "./config";
import { createGearData } from "./gear";
import { SheetKey } from "./sheet";
import { createShipData } from "./ship";
import { SpreadsheetTable } from "./utils";

function createEquippable(start2: Start2): MasterEquippable {
  const equip_exslot = start2.api_mst_equip_exslot;
  const equip_ship = start2.api_mst_equip_ship;
  const equip_exslot_ship = start2.api_mst_equip_exslot_ship;

  const equip_stype = start2.api_mst_stype.map((stype) => {
    const id = stype.api_id;
    const equip_type = Object.entries(stype.api_equip_type)
      .filter(([, equippable]) => equippable === 1)
      .map(([type]) => Number(type));

    return { id, equip_type };
  });

  return { equip_stype, equip_exslot, equip_ship, equip_exslot_ship };
}

export function createMasterData(
  tables: Record<SheetKey, SpreadsheetTable>,
  start2: Start2
): MasterData {
  const shipData = createShipData(start2, tables);
  const gearData = createGearData(tables, start2);
  const equippable = createEquippable(start2);
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
