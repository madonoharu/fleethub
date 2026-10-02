import { describe, expect, it, mock } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import type { Comp } from "fleethub-core";
import type { ReactNode } from "react";

await mock.module("./useFhCore", () => ({
  useFhCore: () => ({ analyzer: {} }),
}));

const { CompProvider, useCompContext } = await import("./useCompContext");
const comp = { default_formation: () => "LineAhead" } as Comp;

describe("fleet analyzer config binding", () => {
  it("updates nested Immer state without changing previous configurations", () => {
    const { result } = renderHook(() => useCompContext(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <CompProvider comp={comp}>{children}</CompProvider>
      ),
    });
    const initial = result.current.config;

    act(() => {
      result.current.bind("left_night_fleet_conditions.starshell_index")(0);
    });
    const leftUpdated = result.current.config;
    act(() => {
      result.current.bind("right_night_fleet_conditions.activates_large_searchlight")(false);
    });

    expect(result.current.config.left_night_fleet_conditions).toEqual({
      starshell_index: 0,
    });
    expect(result.current.config.right_night_fleet_conditions).toEqual({
      activates_large_searchlight: false,
    });
    expect(initial.left_night_fleet_conditions).toEqual({});
    expect(initial.right_night_fleet_conditions).toEqual({});
    expect(leftUpdated.right_night_fleet_conditions).toEqual({});
    expect(result.current.config.formation).toBe("LineAhead");
  });
});
