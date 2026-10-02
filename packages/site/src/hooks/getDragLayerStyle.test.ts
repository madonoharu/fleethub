import { describe, expect, it, mock, spyOn, vi as timers } from "bun:test";

import { createDragLayerStyle } from "./getDragLayerStyle";

describe("drag preview position", () => {
  it("returns the cached style and computes the latest position 50ms after the last event", () => {
    timers.useFakeTimers();
    let offset = { x: 10, y: 20 };
    const monitor = { getSourceClientOffset: mock(() => offset) };
    const getStyle = createDragLayerStyle();

    const initial = getStyle(monitor);
    expect(initial).toEqual({ transform: "translate(10px, 20px)" });
    offset = { x: 30, y: 40 };
    expect(getStyle(monitor)).toBe(initial);
    timers.advanceTimersByTime(49);
    offset = { x: 50, y: 60 };
    expect(getStyle(monitor)).toBe(initial);
    expect(monitor.getSourceClientOffset).toHaveBeenCalledTimes(1);

    timers.advanceTimersByTime(50);
    expect(monitor.getSourceClientOffset).toHaveBeenCalledTimes(2);
    expect(getStyle(monitor)).toEqual({ transform: "translate(50px, 60px)" });
    getStyle.cancel();
  });

  it("refreshes the cached position within 50ms of pending continuous events", () => {
    timers.useFakeTimers();
    let now = 1000;
    spyOn(Date, "now").mockImplementation(() => now);
    let offset = { x: 1, y: 2 };
    const monitor = { getSourceClientOffset: () => offset };
    const getStyle = createDragLayerStyle();

    expect(getStyle(monitor)).toEqual({ transform: "translate(1px, 2px)" });
    now += 49;
    offset = { x: 3, y: 4 };
    expect(getStyle(monitor)).toEqual({ transform: "translate(1px, 2px)" });
    // The compatibility API starts maxWait at the first pending call, and
    // resets the trailing timer on each event. DragLayer reads its result on
    // monitor events; the timer itself does not cause a React render.
    now += 50;
    expect(getStyle(monitor)).toEqual({ transform: "translate(3px, 4px)" });
    getStyle.cancel();
  });

  it("does not show a preview when there is no source offset", () => {
    const getStyle = createDragLayerStyle();
    expect(getStyle({ getSourceClientOffset: () => null })).toBeUndefined();
    getStyle.cancel();
  });
});
