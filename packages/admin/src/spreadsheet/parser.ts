import { Start2 } from "kc-tools";

import { CellValue } from "./SpreadsheetTable";
import { NationalityMap } from "./nationality";

type NamedMaster = { api_name: string; api_id: number };

function replaceMasterNames(str: string, masters: readonly NamedMaster[]): string {
  return masters.reduce(
    (current, master) => current.replaceAll(`"${master.api_name}"`, master.api_id.toString()),
    str,
  );
}

function normalizeExpression(str: string): string {
  const result = str.replace(/\n/g, " ").replace(/\s{2,}/g, " ");

  if (result.includes('"')) {
    throw new Error(`Syntax error: ${result}`);
  }

  return result;
}

export function parseHistoricalAircraftGroup(value: CellValue): number {
  if (typeof value !== "string") {
    return 0;
  }
  const n = parseInt(value, 16);
  return n >= 0 && n <= 255 ? n : 0;
}

export class ExprParser {
  constructor(
    public start2: Start2,
    public ctypeNames: string[],
    public nationalityMap: NationalityMap,
  ) {}

  parseGearName(str: string): string {
    const fn = (str: string) => replaceMasterNames(str, this.start2.api_mst_slotitem);

    return str
      .replace(/gear_id (=|!)= "[^"]+"/g, fn)
      .replace(/(gear_id_in|has|has_any|count)\(\s*("[^"]+"\s*,?\s*)+\)/gs, fn);
  }

  parseGearType(str: string): string {
    return replaceMasterNames(str, this.start2.api_mst_slotitem_equiptype);
  }

  parseShipName(str: string): string {
    return replaceMasterNames(str, this.start2.api_mst_ship);
  }

  parseShipType(str: string): string {
    return replaceMasterNames(str, this.start2.api_mst_stype);
  }

  parseShipClass(str: string): string {
    return this.ctypeNames.reduce(
      (current, shipClassName, id) => current.replaceAll(`"${shipClassName}"`, id.toString()),
      str,
    );
  }

  parseNationality(str: string): string {
    for (const [name, id] of this.nationalityMap.nameMap.entries()) {
      str = str.replaceAll(`"${name}"`, id.toString());
    }

    return str;
  }

  parseGear(str: string): string {
    str = this.parseGearName(str);
    str = this.parseGearType(str);

    return normalizeExpression(str);
  }

  parseShip(str: string): string {
    str = this.parseShipName(str);
    str = this.parseShipType(str);
    str = this.parseShipClass(str);
    str = this.parseNationality(str);

    return normalizeExpression(str);
  }

  replaceHistoricalAircraftGroup(str: string): string {
    return str.replace(/"([A-Z]\d)"/g, (_, s: string) =>
      parseHistoricalAircraftGroup(s).toString(),
    );
  }

  parseHistoricalBonusesShip(str: string): string {
    str = this.parseGearName(str);
    str = this.parseGearType(str);

    str = this.parseShipName(str);
    str = this.parseShipType(str);
    str = this.parseShipClass(str);
    str = this.parseNationality(str);

    str = this.replaceHistoricalAircraftGroup(str);
    return normalizeExpression(str);
  }
}
