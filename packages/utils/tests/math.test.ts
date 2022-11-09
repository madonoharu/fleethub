import { atLeastOne, round, floor, expToAce } from "../src";

describe("utils/math", () => {
  it("atLeastOne", () => {
    expect(atLeastOne([0.1, 0.2, 0.3])).toBe(
      1 - (1 - 0.1) * (1 - 0.2) * (1 - 0.3)
    );
  });

  it("round", () => {
    expect(round(5.5)).toBe(6);
    expect(round(5.4)).toBe(5);

    expect(round(5.554, 2)).toBe(5.55);
    expect(round(5.555, 2)).toBe(5.56);

    expect(round(554, -1)).toBe(550);
    expect(round(555, -1)).toBe(560);
  });

  it("floor", () => {
    expect(floor(5.5)).toBe(5);
    expect(floor(5.4)).toBe(5);

    expect(floor(5.554, 2)).toBe(5.55);
    expect(floor(5.555, 2)).toBe(5.55);

    expect(floor(554, -1)).toBe(550);
    expect(floor(555, -1)).toBe(550);
  });

  it.each([
    [0, 0],
    [9, 0],
    [10, 1],
    [24, 1],
    [25, 2],
    [39, 2],
    [40, 3],
    [54, 3],
    [55, 4],
    [69, 4],
    [70, 5],
    [84, 5],
    [85, 6],
    [99, 6],
    [100, 7],
    [120, 7],
  ])("expToAce", (exp, expected) => {
    expect(expToAce(exp)).toBe(expected);
  });
});
