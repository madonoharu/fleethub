import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import type { expect } from "bun:test";

declare module "bun:test" {
  interface Matchers<T = any> extends TestingLibraryMatchers<
    ReturnType<typeof expect.stringContaining>,
    T
  > {}
}
