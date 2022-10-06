import { Start2 } from "kc-tools";

import { CellValue } from "./SpreadsheetTable";
import { NationalityMap } from "./nationality";

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
    public nationalityMap: NationalityMap
  ) {}

  parseGearName(str: string): string {
    const fn = (str: string) =>
      this.start2.api_mst_slotitem.reduce(
        (current, gear) =>
          current.replaceAll(`"${gear.api_name}"`, gear.api_id.toString()),
        str
      );

    return str
      .replace(/gear_id (=|!)= "[^"]+"/g, fn)
      .replace(/(gear_id_in|has|has_any)\(\s*("[^"]+"\s*,?\s*)+\)/gs, fn);
  }

  parseGearType(str: string): string {
    return this.start2.api_mst_slotitem_equiptype.reduce(
      (current, type) =>
        current.replaceAll(`"${type.api_name}"`, type.api_id.toString()),
      str
    );
  }

  parseShipName(str: string): string {
    return this.start2.api_mst_ship.reduce(
      (current, ship) =>
        current.replaceAll(`"${ship.api_name}"`, ship.api_id.toString()),
      str
    );
  }

  parseShipType(str: string): string {
    return this.start2.api_mst_stype.reduce(
      (current, stype) =>
        current.replaceAll(`"${stype.api_name}"`, stype.api_id.toString()),
      str
    );
  }

  parseShipClass(str: string): string {
    return this.ctypeNames.reduce(
      (current, shipClassName, id) =>
        current.replaceAll(`"${shipClassName}"`, id.toString()),
      str
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

    const result = str.replace(/\n/g, " ").replace(/\s{2,}/g, " ");

    if (result.includes('"')) {
      throw new Error(`Syntax error: ${result}`);
    }

    return result;
  }

  parseShip(str: string): string {
    str = this.parseShipName(str);
    str = this.parseShipType(str);
    str = this.parseShipClass(str);
    str = this.parseNationality(str);

    const result = str.replace(/\n/g, " ").replace(/\s{2,}/g, " ");

    if (result.includes('"')) {
      throw new Error(`Syntax error: ${result}`);
    }

    return result;
  }

  replaceHistoricalAircraftGroup(str: string): string {
    return str.replace(/"([A-Z]\d)"/g, (_, s: string) =>
      parseHistoricalAircraftGroup(s).toString()
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
    const result = str.replace(/\n/g, " ").replace(/\s{2,}/g, " ");

    if (result.includes('"')) {
      throw new Error(`Syntax error: ${result}`);
    }

    return result;
  }
}
