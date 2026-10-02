import { describe, it, expect } from "bun:test";
import { renderWithProviders } from "../../../test-utils";

import StarsLabel from "./StarsLabel";

describe("StarsLabel", () => {
  it("stars 9", () => {
    const { getByTestId } = renderWithProviders(<StarsLabel stars={9} />);
    expect(getByTestId("value")).toHaveTextContent("9");
  });

  it("stars 10", () => {
    const { getByTestId } = renderWithProviders(<StarsLabel stars={10} />);
    expect(getByTestId("value")).toHaveTextContent("M");
  });
});
