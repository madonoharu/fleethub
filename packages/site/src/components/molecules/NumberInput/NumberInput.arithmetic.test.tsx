import { expect, it, mock } from "bun:test";
import { StrictMode, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import NumberInput, { NumberInputProps } from "./NumberInput";

function Example({ onChange, ...props }: Omit<NumberInputProps, "value">) {
  const [value, setValue] = useState<number | null>(10);
  return (
    <StrictMode>
      <NumberInput
        {...props}
        value={value}
        onChange={(next) => {
          setValue(next);
          onChange?.(next);
        }}
      />
      <button onClick={() => setValue(7)}>Reset to default</button>
      <button onClick={() => setValue(null)}>Reset to null</button>
    </StrictMode>
  );
}

it.each([
  { expression: "10/4*2", expected: 5 },
  { expression: "12/2.5*5", expected: 24 },
  { expression: "-10/4*2", expected: -5 },
  { expression: "5/2+0.5", expected: 3 },
])(
  "preserves $expression while typing through fractional intermediate results",
  async ({ expression, expected }) => {
    const onChange = mock();
    const user = userEvent.setup();
    render(<Example integer min={-120} max={120} onChange={onChange} />);
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, expression);
    expect(input).toHaveValue(expression);
    expect(onChange).toHaveBeenLastCalledWith(expected);
    expect(onChange.mock.calls.every(([value]) => Number.isInteger(value))).toBe(true);
    await user.tab();
    expect(input).toHaveValue(expression);
  },
);

it("normalizes a fractional result on blur and follows parent default and null resets", async () => {
  const onChange = mock();
  const user = userEvent.setup();
  render(<Example integer min={-120} max={120} onChange={onChange} />);
  const input = screen.getByRole("textbox");
  await user.clear(input);
  await user.type(input, "-10/4");
  expect(input).toHaveValue("-10/4");
  expect(onChange).toHaveBeenLastCalledWith(-2);
  await user.tab();
  expect(input).toHaveValue("-2");

  fireEvent.change(input, { target: { value: "10/4" } });
  expect(input).toHaveValue("10/4");
  await user.click(screen.getByRole("button", { name: "Reset to default" }));
  expect(input).toHaveValue("7");

  fireEvent.change(input, { target: { value: "10/4" } });
  await user.click(screen.getByRole("button", { name: "Reset to null" }));
  expect(input).toHaveValue("");
});

it("keeps immediate bounds correction when the parent accepts a clamped value", () => {
  const onChange = mock();
  render(<Example integer min={1} max={120} onChange={onChange} />);
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "999.5" } });
  expect(input).toHaveValue("120");
  expect(onChange).toHaveBeenLastCalledWith(120);
  fireEvent.change(input, { target: { value: "-99.5" } });
  expect(input).toHaveValue("1");
  expect(onChange).toHaveBeenLastCalledWith(1);
});
