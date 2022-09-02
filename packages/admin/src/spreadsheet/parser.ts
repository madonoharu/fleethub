import { Start2 } from "kc-tools";

export class ExprParser {
  constructor(public start2: Start2, public ctype: string[]) {}

  parseGear(str: string): string {
    const { start2 } = this;

    str = this.start2.api_mst_slotitem.reduce(
      (current, gear) =>
        current.replaceAll(`"${gear.api_name}"`, gear.api_id.toString()),
      str
    );

    str = start2.api_mst_slotitem_equiptype.reduce(
      (current, type) =>
        current.replaceAll(`"${type.api_name}"`, type.api_id.toString()),
      str
    );

    const result = str
      .replace(/\bname/g, "gear_id")
      .replace(/\n/g, " ")
      .replace(/\s{2,}/g, " ");

    if (result.includes('"')) {
      throw new Error(`Syntax error: ${result}`);
    }

    return result;
  }

  parseShip(str: string): string {
    const { start2, ctype } = this;

    str = start2.api_mst_ship.reduce(
      (current, ship) =>
        current.replaceAll(`"${ship.api_name}"`, ship.api_id.toString()),
      str
    );

    str = start2.api_mst_stype.reduce(
      (current, stype) =>
        current.replaceAll(`"${stype.api_name}"`, stype.api_id.toString()),
      str
    );

    str = ctype.reduce(
      (current, shipClassName, id) =>
        current.replaceAll(`"${shipClassName}"`, id.toString()),
      str
    );

    const result = str
      .replace(/\bname/g, "ship_id")
      .replace(/\n/g, " ")
      .replace(/\s{2,}/g, " ");

    if (result.includes('"')) {
      throw new Error(`Syntax error: ${result}`);
    }

    return result;
  }
}
