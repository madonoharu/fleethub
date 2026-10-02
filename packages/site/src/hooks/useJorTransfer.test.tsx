import { describe, expect, it, mock, spyOn } from "bun:test";
import { act, renderHook } from "@testing-library/react";

import { useJorTransfer } from "./useJorTransfer";

const data = { operations: [] };
const send = (origin: string, value: unknown = data) =>
  act(() => {
    window.dispatchEvent(new MessageEvent("message", { origin, data: value }));
  });
const origin = "https://kcjervis.github.io";

function setup() {
  spyOn(window, "open").mockReturnValue(null);
  const receive = mock();
  const error = mock();
  const hook = renderHook(() => useJorTransfer(receive, error));
  return { ...hook, receive, error, start: () => act(() => hook.result.current()) };
}

describe("Jervis transfer listener", () => {
  it("ignores unrelated messages while waiting and consumes a successful transfer once", () => {
    const { start, receive, error } = setup();
    start();
    send("https://example.test");
    send(origin);
    send(origin);
    expect(receive).toHaveBeenCalledTimes(1);
    expect(receive).toHaveBeenCalledWith(data);
    expect(error).not.toHaveBeenCalled();
  });

  it("replaces a pending listener when the transfer button is clicked again", () => {
    const { start, receive } = setup();
    start();
    start();
    start();
    send(origin);
    expect(receive).toHaveBeenCalledTimes(1);
  });

  it("reports invalid transfer data and allows the next valid message to recover", () => {
    const { start, receive, error } = setup();
    start();
    send(origin, { unrelated: true });
    expect(receive).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledTimes(1);
    send(origin);
    expect(receive).toHaveBeenCalledTimes(1);
  });

  it("cleans up when the welcome page is left", () => {
    const { start, receive, unmount } = setup();
    start();
    unmount();
    send(origin);
    expect(receive).not.toHaveBeenCalled();
  });

  it("starts a fresh transfer after unmounting without reviving the old listener", () => {
    const previous = setup();
    previous.start();
    previous.unmount();
    const current = setup();
    current.start();
    send(origin);
    send(origin);
    expect(previous.receive).not.toHaveBeenCalled();
    expect(current.receive).toHaveBeenCalledTimes(1);
  });

  it("keeps the transfer pending when converting valid-shaped data throws", () => {
    const { start, receive, error } = setup();
    receive.mockImplementationOnce(() => {
      throw new Error("Invalid legacy operation");
    });
    start();
    send(origin);
    expect(error).toHaveBeenCalledTimes(1);
    send(origin);
    send(origin);
    expect(receive).toHaveBeenCalledTimes(2);
  });
});
