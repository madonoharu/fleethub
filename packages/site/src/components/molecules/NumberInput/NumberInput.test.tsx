import { render, screen, fireEvent, act } from "@testing-library/react";

import NumberInput from "./NumberInput";

function press(element: HTMLButtonElement, msToRun = 0) {
  fireEvent.mouseDown(element);
  act(() => {
    jest.advanceTimersByTime(msToRun);
  });
  fireEvent.mouseUp(element);
}

afterEach(() => {
  jest.useRealTimers();
});

describe("NumberInput", () => {
  it("increase and decrease", () => {
    jest.useFakeTimers();

    const mockFn = jest.fn<void, [number]>();

    render(<NumberInput value={0} onChange={mockFn} />);

    const input = screen.getByRole<HTMLInputElement>("textbox");
    const increaseButton = screen.getByLabelText<HTMLButtonElement>("increase");
    const decreaseButton = screen.getByLabelText<HTMLButtonElement>("decrease");

    expect(input).toHaveValue("0");

    press(increaseButton, 1000);
    expect(input).toHaveValue("14");
    expect(mockFn.mock.calls[0][0]).toBe(14);

    press(decreaseButton, 399);
    expect(input).toHaveValue("13");
    expect(mockFn.mock.calls[1][0]).toBe(13);
  });

  it("null", () => {
    jest.useFakeTimers();

    const mockFn = jest.fn<void, [number]>();
    render(<NumberInput value={null} onChange={mockFn} />);

    const input = screen.getByRole("textbox");
    const increaseButton = screen.getByLabelText("increase");
    const decreaseButton = screen.getByLabelText("decrease");

    expect(input).toHaveValue("");
    fireEvent.mouseDown(increaseButton);
    expect(input).toHaveValue("1");

    fireEvent.mouseDown(decreaseButton);
    expect(input).toHaveValue("0");
  });

  it("change value", () => {
    const mockFn = jest.fn<void, [number]>();
    const { rerender } = render(<NumberInput value={1} onChange={mockFn} />);
    rerender(<NumberInput value={2} onChange={mockFn} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("2");
  });
});
