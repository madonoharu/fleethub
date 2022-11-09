import { MORALE_STATES } from "@fh/utils";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "../../../test-utils";

import MoraleStateIcon from "./MoraleStateIcon";

describe("MoraleStateIcon", () => {
  it.each(MORALE_STATES)("%s", (state) => {
    renderWithProviders(<MoraleStateIcon state={state} />);
    const svg = screen.getByLabelText<HTMLElement>(state);
    expect(svg).toBeTruthy();
  });
});
