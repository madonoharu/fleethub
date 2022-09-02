import { EquippabilityRule, MasterEquippability } from "fleethub-core";

import { ExprParser } from "./parser";
import { cellValueToString, SpreadsheetTable } from "./utils";

export function createEquippability(
  parser: ExprParser,
  table: SpreadsheetTable
): MasterEquippability {
  const start2 = parser.start2;
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

  const rules = table.rows.map((row) => {
    const rule: EquippabilityRule = {
      ship: parser.parseShip(cellValueToString(row.ship)),
    };

    if (row.keys) {
      rule.keys = String(row.keys).split(",");
    }

    if (row.include) {
      rule.include = parser.parseGear(String(row.include));
    }
    if (row.exclude) {
      rule.exclude = parser.parseGear(String(row.exclude));
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
