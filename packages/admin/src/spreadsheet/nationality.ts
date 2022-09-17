import { SpreadsheetTable } from "./SpreadsheetTable";

export class NationalityMap {
  nameMap: Map<string, number>;
  ctypeMap: Map<number, number>;

  constructor(table: SpreadsheetTable) {
    const nameMap = new Map<string, number>();
    const ctypeMap = new Map<number, number>();

    table.rows.forEach((row) => {
      const name = String(row.name);
      const id = Number(row.id);

      if (!Number.isInteger(id)) {
        return;
      }

      nameMap.set(name, id);

      const ctypes = String(row.ctypes)
        .split(",")
        .map((str) => Number(str))
        .filter(Number.isInteger);

      ctypes.forEach((ctype) => {
        ctypeMap.set(ctype, id);
      });
    });

    this.nameMap = nameMap;
    this.ctypeMap = ctypeMap;
  }

  getByName(name: string): number | undefined {
    return this.nameMap.get(name);
  }

  getByCtype(ctype: number): number | undefined {
    return this.ctypeMap.get(ctype);
  }
}
