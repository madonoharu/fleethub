import { render, screen } from "@testing-library/react";

import ProficiencyIcon from "./ProficiencyIcon";

describe("ProficiencyIcon", () => {
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
  ])("exp %i", (exp, ace) => {
    render(<ProficiencyIcon exp={exp} />);

    const expLabel = screen.getByLabelText("exp");
    const image = screen.getByRole<HTMLImageElement>("img");

    expect(expLabel).toHaveTextContent(exp.toString());
    expect(image).toHaveAttribute("alt", `ace${ace}`);
    expect(image.src).toContain(`ace${ace}.png`);
  });
});
