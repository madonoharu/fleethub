import { mapValues } from "../src";

describe("utils/object", () => {
  const obj = { a: 1, b: 2, c: 3 };
  it("mapValues", () => {
    expect(mapValues(obj, (value) => value * 7)).toEqual({
      a: 7,
      b: 14,
      c: 21,
    });
  });
});
