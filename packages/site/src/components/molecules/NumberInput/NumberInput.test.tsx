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
    expect(mockFn).toHaveBeenLastCalledWith(14);

    press(decreaseButton, 399);
    expect(input).toHaveValue("13");
    expect(mockFn).toHaveBeenLastCalledWith(13);
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

  it("evaluate", () => {
    const mockFn = jest.fn<void, [number]>();
    render(<NumberInput value={1} onChange={mockFn} />);
    const input = screen.getByRole<HTMLInputElement>("textbox");

    fireEvent.change(input, { target: { value: "*+-1.3" } });
    expect(mockFn).not.toBeCalled();

    fireEvent.change(input, {
      target: { value: "-1.2 * -1.3 - 1.42 + 5 / 2" },
    });
    expect(mockFn).toHaveBeenLastCalledWith(-1.2 * -1.3 - 1.42 + 5 / 2);
  });

  it("blur", () => {
    const mockFn = jest.fn<void, [number]>();
    render(<NumberInput value={2} onChange={mockFn} />);
    const input = screen.getByRole<HTMLInputElement>("textbox");

    fireEvent.change(input, { target: { value: "3" } });
    expect(input).toHaveValue("3");
    expect(mockFn).toBeCalledTimes(1);
    expect(mockFn).toHaveBeenLastCalledWith(3);

    fireEvent.change(input, { target: { value: "" } });
    expect(input).toHaveValue("");
    expect(mockFn).toBeCalledTimes(1);

    fireEvent.blur(input);
    expect(input).toHaveValue("2");
    expect(mockFn).toBeCalledTimes(1);

    fireEvent.change(input, { target: { value: "０.１２３４５６７８９" } });
    expect(input).toHaveValue("０.１２３４５６７８９");
    expect(mockFn).toBeCalledTimes(2);
    expect(mockFn).toHaveBeenLastCalledWith(0.123456789);

    fireEvent.blur(input);
    expect(input).toHaveValue("0.123456789");
    expect(mockFn).toBeCalledTimes(2);
  });

  it("compositionEnd", () => {
    const mockFn = jest.fn<void, [number]>();
    render(<NumberInput value={1} onChange={mockFn} />);
    const input = screen.getByRole<HTMLInputElement>("textbox");

    fireEvent.change(input, { target: { value: "１２３" } });
    expect(input).toHaveValue("１２３");
    expect(mockFn).toBeCalledTimes(1);
    expect(mockFn).toHaveBeenLastCalledWith(123);

    fireEvent.compositionEnd(input);
    expect(input).toHaveValue("123");
    expect(mockFn).toBeCalledTimes(1);

    fireEvent.change(input, { target: { value: "" } });
    fireEvent.compositionEnd(input);
    expect(input).toHaveValue("");
    expect(mockFn).toBeCalledTimes(1);
  });
});
