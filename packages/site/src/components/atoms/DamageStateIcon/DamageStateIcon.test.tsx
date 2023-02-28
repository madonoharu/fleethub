import { DAMAGE_STATES } from "@fh/utils";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "../../../test-utils";

import DamageStateIcon from "./DamageStateIcon";

describe("MoraleStateIcon", () => {
  it.each(DAMAGE_STATES)("%s", (state) => {
    renderWithProviders(<DamageStateIcon state={state} />);
    const svg = screen.getByLabelText<HTMLElement>(state);
    console.log(svg);
    expect(svg).toBeTruthy();
  });
});
