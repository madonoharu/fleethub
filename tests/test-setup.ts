import { afterEach, expect, mock, vi as timers } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import * as matchers from "@testing-library/jest-dom/matchers";

// Keep Bun's networking and clock APIs; the DOM emulator supplies browser globals.
const nativeGlobals = {
  fetch,
  Headers,
  Request,
  Response,
  AbortController,
  AbortSignal,
  FormData,
  Blob,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
};
GlobalRegistrator.register({ url: "http://localhost:3000" });
Object.assign(globalThis, nativeGlobals);
Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
  configurable: true,
  writable: true,
  value: true,
});
expect.extend(matchers);

// Import after registering document so Testing Library's screen binds to this DOM.
const { cleanup } = await import("@testing-library/react");
afterEach(() => {
  cleanup();
  timers.useRealTimers();
  mock.restore();
});
