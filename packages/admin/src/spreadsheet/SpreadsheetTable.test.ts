import { intoCellValue } from "./SpreadsheetTable";

describe("spreadsheet cell conversion", () => {
  it("keeps numbers and booleans while treating empty cells as missing", () => {
    expect(intoCellValue(0)).toBe(0);
    expect(intoCellValue(false)).toBe(false);
    expect(intoCellValue("text")).toBe("text");
    expect(intoCellValue("")).toBeUndefined();
    expect(intoCellValue(null)).toBeUndefined();
    expect(intoCellValue(undefined)).toBeUndefined();
  });

  it("preserves the comma separated array format used by master data", () => {
    expect(intoCellValue([1, null, false, [2, 3]])).toBe("1,,false,2,3");
    expect(intoCellValue([])).toBe("");
  });

  it("rejects object values instead of storing an uninformative cell", () => {
    expect(() => intoCellValue({ gear_id: 1 })).toThrow(TypeError);
    expect(() => intoCellValue([{ gear_id: 1 }])).toThrow(TypeError);
  });
});
