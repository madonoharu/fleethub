import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";

import { copy } from "../src/copy";

const originalExecCommand = Object.getOwnPropertyDescriptor(document, "execCommand");

function copyEvent(clipboardData: DataTransfer | null = new DataTransfer()) {
  return new ClipboardEvent("copy", {
    bubbles: true,
    cancelable: true,
    clipboardData,
  });
}

function expectListenerRemoved() {
  const event = copyEvent();
  document.dispatchEvent(event);
  expect(event.clipboardData?.getData("text/plain")).toBe("");
  expect(event.defaultPrevented).toBe(false);
}

describe("utils/copy", () => {
  beforeEach(() => {
    spyOn(navigator.clipboard, "writeText").mockRejectedValue(
      new DOMException("Permission denied", "NotAllowedError"),
    );
  });

  afterEach(() => {
    if (originalExecCommand) {
      Object.defineProperty(document, "execCommand", originalExecCommand);
    } else {
      Reflect.deleteProperty(document, "execCommand");
    }
  });

  function execCommand(implementation: (command: string) => boolean) {
    const command = mock(implementation);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: command,
    });
    return command;
  }

  it("uses the modern clipboard API without invoking the fallback", async () => {
    const writeText = spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    const command = execCommand(() => false);

    await copy("編成の共有 URL");

    expect(writeText).toHaveBeenCalledWith("編成の共有 URL");
    expect(command).not.toHaveBeenCalled();
    expectListenerRemoved();
  });

  it.each(["赤城改\n装備: 零式艦戦 ✈️", ""])(
    "writes the exact fallback value without moving focus: %j",
    async (value) => {
      const input = document.createElement("input");
      document.body.appendChild(input);
      input.focus();
      const createElement = spyOn(document, "createElement");
      const event = copyEvent();
      const command = execCommand(() => {
        document.dispatchEvent(event);
        return true;
      });

      try {
        await copy(value);

        expect(event.clipboardData?.getData("text/plain")).toBe(value);
        expect(event.defaultPrevented).toBe(true);
        expect(command).toHaveBeenCalledWith("copy");
        expect(createElement).not.toHaveBeenCalled();
        expect(document.activeElement).toBe(input);
        expectListenerRemoved();
      } finally {
        input.remove();
      }
    },
  );

  it("rejects when the native command reports failure, even after handling its event", async () => {
    execCommand(() => {
      document.dispatchEvent(copyEvent());
      return false;
    });

    expect(await copy("must not report success").catch((error: unknown) => error)).toEqual(
      new Error("Failed to copy text to the clipboard"),
    );
    expectListenerRemoved();
  });

  it("rejects a successful command that never supplies a writable copy event", async () => {
    execCommand(() => true);

    expect(await copy("must not report success").catch((error: unknown) => error)).toEqual(
      new Error("Failed to copy text to the clipboard"),
    );
    expectListenerRemoved();
  });

  it("rejects an event with no clipboard data", async () => {
    const event = copyEvent(null);
    execCommand(() => {
      document.dispatchEvent(event);
      return true;
    });

    expect(await copy("must not report success").catch((error: unknown) => error)).toEqual(
      new Error("Failed to copy text to the clipboard"),
    );
    expect(event.defaultPrevented).toBe(false);
    expectListenerRemoved();
  });

  it("removes its event handler when the native command throws", async () => {
    const failure = new Error("Copy command unavailable");
    execCommand(() => {
      throw failure;
    });

    expect(await copy("must not leak a handler").catch((error: unknown) => error)).toBe(failure);
    expectListenerRemoved();
  });
});
