import { StrictMode, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import NumberInput, { NumberInputProps } from "./NumberInput";

function ControlledNumberInput({
  initialValue,
  onChange,
  ...props
}: Omit<NumberInputProps, "value"> & { initialValue: number }) {
  const [value, setValue] = useState(initialValue);
  return (
    <NumberInput
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

afterEach(() => {
  jest.useRealTimers();
});

describe("controlled NumberInput under React StrictMode", () => {
  it("commits a step only when the press finishes and uses the parent value for the next step", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onChange = jest.fn();
    render(
      <StrictMode>
        <ControlledNumberInput
          initialValue={119}
          min={1}
          max={120}
          onChange={onChange}
        />
      </StrictMode>,
    );
    const input = screen.getByRole("textbox");

    await user.pointer({
      target: screen.getByLabelText("increase"),
      keys: "[MouseLeft>]",
    });
    expect(input).toHaveValue("120");
    expect(onChange).not.toHaveBeenCalled();
    await user.pointer({ keys: "[/MouseLeft]" });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(120);

    await user.click(screen.getByLabelText("decrease"));
    expect(input).toHaveValue("119");
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(119);
  });

  it("keeps native slot events while updating controlled values, clamping, and restoring empty input on blur", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onKeyDown = jest.fn();
    render(
      <StrictMode>
        <ControlledNumberInput
          initialValue={119}
          min={1}
          max={120}
          onChange={onChange}
          slotProps={{
            htmlInput: () => ({
              "aria-label": "headquarters level",
              autoComplete: "off",
              onKeyDown,
            }),
          }}
        />
      </StrictMode>,
    );
    const input = screen.getByRole("textbox", { name: "headquarters level" });
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).toHaveAttribute("autocomplete", "off");

    fireEvent.change(input, { target: { value: "１２３" } });
    expect(onChange).toHaveBeenLastCalledWith(120);
    expect(input).toHaveValue("120");
    fireEvent.change(input, { target: { value: "" } });
    expect(input).toHaveValue("");
    await user.click(input);
    await user.keyboard("{Tab}");
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue("120");
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
