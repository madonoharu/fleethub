import { expect, it, mock, vi as timers } from "bun:test";
import { act, fireEvent, render, screen } from "@testing-library/react";

import { useLongPress } from "./useLongPress";

it("cancels a pending repeat when its button unmounts", async () => {
  timers.useFakeTimers();
  const onPress = mock();
  const onFinish = mock();
  function Button() {
    return <button {...useLongPress({ onPress, onFinish })}>Increase</button>;
  }
  const { unmount } = render(<Button />);
  fireEvent.pointerDown(screen.getByRole("button"), {
    pointerId: 1,
    button: 0,
  });
  expect(onPress).toHaveBeenCalledTimes(1);
  unmount();
  await act(async () => {
    timers.advanceTimersByTime(1000);
  });
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(onFinish).not.toHaveBeenCalled();
});
