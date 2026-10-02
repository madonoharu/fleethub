import { describe, it, expect, mock, vi as timers } from "bun:test";
import { StrictMode, useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
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

describe("controlled NumberInput under React StrictMode", () => {
  it.each([" ", "Enter"])("commits a keyboard step once for %s", async (key) => {
    const user = userEvent.setup();
    const onChange = mock();
    render(<ControlledNumberInput initialValue={99} integer onChange={onChange} />);
    const increase = screen.getByLabelText("increase");
    act(() => increase.focus());
    await user.keyboard(key === " " ? " " : "{Enter}");
    expect(screen.getByRole("textbox")).toHaveValue("100");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(100);
  });

  it("repeats a held keyboard step and commits on blur without leaving a timer running", async () => {
    timers.useFakeTimers();
    const onChange = mock();
    render(<ControlledNumberInput initialValue={99} integer onChange={onChange} />);
    const increase = screen.getByLabelText("increase");
    fireEvent.keyDown(increase, { key: " " });
    await act(async () => {
      timers.advanceTimersByTime(500);
    });
    fireEvent.keyDown(increase, { key: " ", repeat: true });
    expect(screen.getByRole("textbox")).toHaveValue("103");
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.blur(increase);
    await act(async () => {
      timers.advanceTimersByTime(1000);
    });
    fireEvent.keyUp(increase, { key: " " });
    expect(screen.getByRole("textbox")).toHaveValue("103");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(103);
  });

  it("normalizes integer input before dispatch and restores invalid or clamped text on blur", () => {
    const onChange = mock();
    render(
      <ControlledNumberInput initialValue={120} integer min={1} max={120} onChange={onChange} />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "999" } });
    fireEvent.blur(input);
    expect(input).toHaveValue("120");
    expect(onChange).toHaveBeenLastCalledWith(120);

    fireEvent.change(input, { target: { value: "12+" } });
    fireEvent.blur(input);
    expect(input).toHaveValue("120");
    expect(onChange).toHaveBeenCalledTimes(1);

    fireEvent.change(input, { target: { value: "99.5" } });
    expect(onChange).toHaveBeenLastCalledWith(99);
    fireEvent.blur(input);
    expect(input).toHaveValue("99");

    fireEvent.change(input, { target: { value: "99+0.5" } });
    fireEvent.blur(input);
    expect(input).toHaveValue("99");
    expect(onChange).toHaveBeenLastCalledWith(99);

    fireEvent.change(input, { target: { value: "９０+９" } });
    fireEvent.blur(input);
    expect(input).toHaveValue("90+9");
    expect(onChange).toHaveBeenLastCalledWith(99);
  });

  it("keeps fractional values and arithmetic in controls that accept decimals", () => {
    const onChange = mock();
    render(<ControlledNumberInput initialValue={1.5} onChange={onChange} step={0.1} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "1.25+0.25" } });
    fireEvent.blur(input);
    expect(input).toHaveValue("1.25+0.25");
    expect(onChange).toHaveBeenLastCalledWith(1.5);
  });

  it.each([
    { initial: 99, typed: "99.5", button: "increase", expected: 100 },
    { initial: 120, typed: "999", button: "decrease", expected: 119 },
    { initial: 1, typed: "-99", button: "increase", expected: 2 },
  ])(
    "steps from the accepted integer value before $typed blurs",
    async ({ initial, typed, button, expected }) => {
      const user = userEvent.setup();
      const onChange = mock();
      render(
        <ControlledNumberInput
          initialValue={initial}
          integer
          min={1}
          max={120}
          onChange={onChange}
        />,
      );
      const input = screen.getByRole("textbox");
      await user.click(input);
      fireEvent.change(input, { target: { value: typed } });
      // Pointer down runs before the field's blur handler normalizes its text.
      await user.click(screen.getByLabelText(button));
      expect(input).toHaveValue(String(expected));
      expect(onChange).toHaveBeenLastCalledWith(expected);
    },
  );

  it("commits one step for a touch tap followed by compatibility mouse events", async () => {
    timers.useFakeTimers();
    const onChange = mock();
    render(<ControlledNumberInput initialValue={99} onChange={onChange} />);
    const input = screen.getByRole("textbox");
    const increase = screen.getByLabelText("increase");
    const touch = { pointerId: 7, pointerType: "touch", button: 0 };

    await act(async () => {
      fireEvent.pointerDown(increase, touch);
      fireEvent.touchStart(increase, {
        touches: [{ identifier: 7, target: increase, clientX: 10, clientY: 10 }],
      });
    });
    expect(input).toHaveValue("100");
    expect(onChange).not.toHaveBeenCalled();
    await act(async () => {
      fireEvent.pointerUp(increase, touch);
      fireEvent.touchEnd(increase);
    });
    await act(async () => {
      fireEvent.mouseDown(increase);
      fireEvent.mouseUp(increase);
      fireEvent.click(increase);
    });
    expect(input).toHaveValue("100");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(100);
  });

  it.each(["pointerCancel", "pointerLeave", "lostPointerCapture"] as const)(
    "stops a long press and commits once on %s",
    async (cancelEvent) => {
      timers.useFakeTimers();
      const onChange = mock();
      render(<ControlledNumberInput initialValue={10} onChange={onChange} />);
      const input = screen.getByRole("textbox");
      const increase = screen.getByLabelText("increase");
      const pointer = { pointerId: 7, pointerType: "touch", button: 0 };

      await act(async () => {
        fireEvent.pointerDown(increase, pointer);
      });
      await act(async () => {
        timers.advanceTimersByTime(500);
      });
      expect(input).toHaveValue("14");
      expect(onChange).not.toHaveBeenCalled();
      await act(async () => {
        fireEvent[cancelEvent](increase, pointer);
      });
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith(14);
      await act(async () => {
        timers.advanceTimersByTime(1000);
        fireEvent.pointerUp(increase, pointer);
      });
      expect(input).toHaveValue("14");
      expect(onChange).toHaveBeenCalledTimes(1);
    },
  );

  it("does not start a pointer press on a disabled step button", async () => {
    const onChange = mock();
    render(<ControlledNumberInput initialValue={10} disabled onChange={onChange} />);
    const increase = screen.getByLabelText("increase");
    await act(async () => {
      fireEvent.pointerDown(increase, { pointerId: 1, button: 0 });
      fireEvent.pointerUp(increase, { pointerId: 1 });
    });
    expect(screen.getByRole("textbox")).toHaveValue("10");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("commits a step only when the press finishes and uses the parent value for the next step", async () => {
    timers.useFakeTimers();
    const user = userEvent.setup({
      advanceTimers: async (milliseconds) => {
        await act(() => timers.advanceTimersByTime(milliseconds));
      },
    });
    const onChange = mock();
    render(
      <StrictMode>
        <ControlledNumberInput initialValue={119} min={1} max={120} onChange={onChange} />
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
    const onChange = mock();
    const onKeyDown = mock();
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
