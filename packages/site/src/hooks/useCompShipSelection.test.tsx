import { describe, expect, it } from "bun:test";
import { act, renderHook } from "@testing-library/react";

import { useCompShipSelection } from "./useCompShipSelection";

function comp(...ids: string[]) {
  return {
    first_ship_id: () => ids[0],
    has_ship_eid: (id: string) => ids.includes(id),
  };
}

type Props = { comp: ReturnType<typeof comp> | undefined };

function setup(initialComp: Props["comp"]) {
  return renderHook(({ comp }: Props) => useCompShipSelection(comp), {
    initialProps: { comp: initialComp },
  });
}

describe("attack analyzer ship selection", () => {
  it("starts with the first ship and preserves a valid manual selection across reordered comps", () => {
    const { result, rerender } = setup(comp("a", "b"));
    expect(result.current[0]).toBe("a");

    act(() => result.current[1]("b"));
    rerender({ comp: comp("c", "b", "a") });

    expect(result.current[0]).toBe("b");
  });

  it("immediately falls back when the selected ship leaves and keeps that new selection on undo", () => {
    const { result, rerender } = setup(comp("a", "b"));
    act(() => result.current[1]("b"));

    rerender({ comp: comp("a") });
    expect(result.current[0]).toBe("a");
    rerender({ comp: comp("a", "b") });
    expect(result.current[0]).toBe("a");
  });

  it("exposes no stale ship for empty or absent comps and remembers selection when restored", () => {
    const { result, rerender } = setup(comp("a", "b"));
    act(() => result.current[1]("b"));

    rerender({ comp: comp() });
    expect(result.current[0]).toBeUndefined();
    rerender({ comp: undefined });
    expect(result.current[0]).toBeUndefined();
    rerender({ comp: comp("a", "b") });
    expect(result.current[0]).toBe("b");
  });

  it("commits a fallback for a different nonempty comp instead of restoring an obsolete choice", () => {
    const { result, rerender } = setup(comp("a", "b"));
    act(() => result.current[1]("b"));

    rerender({ comp: comp("x", "y") });
    expect(result.current[0]).toBe("x");
    rerender({ comp: comp("a", "b") });
    expect(result.current[0]).toBe("a");
  });
});
