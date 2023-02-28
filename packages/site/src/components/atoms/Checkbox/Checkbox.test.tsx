import { render, fireEvent } from "@testing-library/react";

import Checkbox from "./Checkbox";

describe("Checkbox", () => {
  it("label", () => {
    const { getByText } = render(<Checkbox label="Label Text" />);
    expect(getByText("Label Text")).toBeInTheDocument();
  });

  it("`checked={true}`", () => {
    const mockFn = jest.fn<void, [boolean]>();
    const { getByRole } = render(<Checkbox checked={true} onChange={mockFn} />);
    const checkbox = getByRole("checkbox");
    expect(checkbox).toHaveProperty("checked", true);
    fireEvent.click(checkbox);
    expect(mockFn).lastCalledWith(false);
    fireEvent.click(checkbox);
    expect(mockFn).lastCalledWith(false);
  });

  it("`checked={false}`", () => {
    const mockFn = jest.fn<void, [boolean]>();
    const { getByRole } = render(
      <Checkbox checked={false} onChange={mockFn} />
    );
    const checkbox = getByRole("checkbox");
    expect(checkbox).toHaveProperty("checked", false);
    fireEvent.click(checkbox);
    expect(mockFn).lastCalledWith(true);
    fireEvent.click(checkbox);
    expect(mockFn).lastCalledWith(true);
  });
});
