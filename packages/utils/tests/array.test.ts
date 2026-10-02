import { describe, expect, it } from "bun:test";

import { includes, sumBy, uniq, uniqBy, groupBy } from "../src";

describe("utils/array", () => {
  it("uniq", () => {
    const array = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4];
    expect(uniq(array)).toEqual([1, 2, 3, 4]);
  });

  it("sumBy", () => {
    const array = [{ v: 1 }, { v: 2 }, { v: 3 }];
    expect(sumBy(array, (item) => item.v)).toBe(6);
  });

  it("keeps the first equipment ID when master-data names are duplicated", () => {
    const gears = [
      { api_id: 1, api_name: "13号対空電探" },
      { api_id: 2, api_name: "13号対空電探" },
      { api_id: 3, api_name: "22号対水上電探" },
    ];

    const result = uniqBy(gears, (gear) => gear.api_name);

    expect(result).toEqual([gears[0], gears[2]]);
    expect(result[0]).toBe(gears[0]);
    expect(gears).toHaveLength(3);
  });

  it("includes", () => {
    expect(includes(["a", "b", "c"], "a")).toBe(true);
  });

  it("groupBy", () => {
    const result = groupBy(
      [
        { name: "foo", value: 1 },
        { name: "bar", value: 1 },
        { name: "baz", value: 2 },
      ],
      (item) => item.value,
    );

    expect(result).toEqual({
      1: [
        { name: "foo", value: 1 },
        { name: "bar", value: 1 },
      ],
      2: [{ name: "baz", value: 2 }],
    });
  });

  it("groups labels that match inherited Object method names", () => {
    const rows = [
      { label: "constructor", id: 1 },
      { label: "toString", id: 2 },
      { label: "constructor", id: 3 },
    ];

    const result = groupBy(rows, (row) => row.label);

    expect(result).toEqual({
      constructor: [rows[0], rows[2]],
      toString: [rows[1]],
    });
    expect(Object.hasOwn(result, "constructor")).toBe(true);
    expect(Object.hasOwn(result, "toString")).toBe(true);
  });
});
