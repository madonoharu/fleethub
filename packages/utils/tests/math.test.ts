import { atLeastOne, randint, round, floor } from "../src";

describe("utils/math", () => {
  it("atLeastOne", () => {
    expect(atLeastOne([0.1, 0.2, 0.3])).toBe(
      1 - (1 - 0.1) * (1 - 0.2) * (1 - 0.3)
    );
  });

  it("randint", () => {
    const randomMock = jest.spyOn(Math, "random");

    randomMock.mockReturnValue(0.9);
    expect(randint(9)).toBe(9);

    randomMock.mockReturnValue(0.09);
    expect(randint(9)).toBe(0);
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
});
