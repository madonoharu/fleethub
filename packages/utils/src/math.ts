export const atLeastOne = (xs: number[]) =>
  1 - xs.reduce((acc, x) => acc * (1 - x), 1);

function createRound(methodName: "round" | "floor") {
  const func = Math[methodName];

  return (number: number, precision?: number) => {
    precision =
      precision == null
        ? 0
        : precision >= 0
        ? Math.min(precision, 292)
        : Math.max(precision, -292);
    if (precision) {
      // Shift with exponential notation to avoid floating-point issues.
      // See [MDN](https://mdn.io/round#Examples) for more details.
      let pair = `${number}e`.split("e");
      const value = func(+`${pair[0]}e${+pair[1] + precision}`);

      pair = `${value}e`.split("e");
      return +`${pair[0]}e${+pair[1] - precision}`;
    }
    return func(number);
  };
}

export const round = createRound("round");
export const floor = createRound("floor");
