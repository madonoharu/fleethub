import { render, screen } from "@testing-library/react";

import { ACE_ICONS } from "../../../images/icons";

import ProficiencyIcon from "./ProficiencyIcon";
import "@testing-library/jest-dom";

describe("ACE_ICONS", () => {
  it("covers every ace rank", () => {
    expect(ACE_ICONS).toHaveLength(8);
    expect(ACE_ICONS.every(Boolean)).toBe(true);
  });
});

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
    expect(image.src).not.toContain("/_next/image");
  });
});
