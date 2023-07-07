import {
  EquippabilityRule,
  MasterEquippability,
  MstEquipExslotShip,
} from "fleethub-core";

import { SpreadsheetTable } from "./SpreadsheetTable";
import { ExprParser } from "./parser";
import { toCellString } from "./utils";

export function createEquippability(
  parser: ExprParser,
  table: SpreadsheetTable
): MasterEquippability {
  const start2 = parser.start2;
  const equip_exslot = start2.api_mst_equip_exslot;
  const equip_ship = start2.api_mst_equip_ship;
  const equip_exslot_ship =
    start2.api_mst_equip_exslot_ship as unknown as Record<
      number,
      MstEquipExslotShip
    >;

  const equip_stype = start2.api_mst_stype.map((stype) => {
    const id = stype.api_id;
    const equip_type = Object.entries(stype.api_equip_type)
      .filter(([, equippable]) => equippable === 1)
      .map(([type]) => Number(type));

    return { id, equip_type };
  });

  const rules = table.rows.map((row) => {
    const rule: EquippabilityRule = {
      ship: parser.parseShip(toCellString(row.ship)),
    };

    if (row.keys) {
      rule.keys = String(row.keys).split(/\s*,\s*/);
    }

    if (row.include) {
      rule.include = parser.parseGear(toCellString(row.include));
    }
    if (row.exclude) {
      rule.exclude = parser.parseGear(toCellString(row.exclude));
    }

    return rule;
  });

  return {
    equip_stype,
    equip_exslot,
    equip_ship,
    equip_exslot_ship,
    rules,
  };
}
