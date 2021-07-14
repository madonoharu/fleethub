import { nonNullable, range } from "../src";

describe("utils/misc", () => {
  it("range", () => {
    expect(range(5)).toEqual([0, 1, 2, 3, 4]);
  });

  it("cloneJson", () => {
    expect(nonNullable(0)).toBe(true);
    expect(nonNullable(false)).toBe(true);
    expect(nonNullable("")).toBe(true);
    expect(nonNullable(undefined)).toBe(false);
    expect(nonNullable(null)).toBe(false);
  });
});
