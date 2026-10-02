import { describe, expect, it, mock } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import type { Comp, NodeAttackAnalyzerConfig } from "fleethub-core";

await mock.module("next-i18next/pages", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
await mock.module("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
await mock.module("../CompShipList", () => ({ default: () => null }));
await mock.module("../NightFleetConditionsForm", () => ({
  default: () => null,
}));

// Keep the real controls, while avoiding the unrelated hook/dialog barrel
// cycle that a standalone form render would otherwise initialize.
const { default: Input } = await import("../../atoms/Input/Input");
await mock.module("../../atoms", () => ({ Input }));
const { default: Select } = await import("../../molecules/Select/Select");
await mock.module("../../molecules", () => ({ Select }));

const { default: AnalyzerForm } = await import("./AnalyzerForm");
const comp = { is_combined: () => false } as Comp;

describe("analyzer formation binding", () => {
  it.each(["left", "right"] as const)(
    "creates an absent %s config through the real formation control without mutating the original",
    (side) => {
      const config: NodeAttackAnalyzerConfig = { engagement: "Parallel" };
      const onConfigChange = mock<(value: NodeAttackAnalyzerConfig) => void>();
      render(
        <AnalyzerForm
          config={config}
          leftShipId={undefined}
          rightShipId={undefined}
          leftComp={side === "left" ? comp : undefined}
          rightComp={side === "right" ? comp : undefined}
          onLeftShipChange={() => {}}
          onRightShipChange={() => {}}
          onConfigChange={onConfigChange}
        />,
      );

      fireEvent.mouseDown(screen.getByRole("combobox"));
      fireEvent.click(screen.getByRole("option", { name: "DoubleLine" }));

      expect(onConfigChange).toHaveBeenCalledWith({
        engagement: "Parallel",
        [side]: { formation: "DoubleLine" },
      });
      expect(config).toEqual({ engagement: "Parallel" });
    },
  );

  it("updates a nested draft while keeping existing night conditions and the other side", () => {
    const config: NodeAttackAnalyzerConfig = {
      left: { formation: "LineAhead", starshell_index: 0 },
      right: { formation: "Diamond" },
    };
    const onConfigChange = mock<(value: NodeAttackAnalyzerConfig) => void>();
    render(
      <AnalyzerForm
        config={config}
        leftShipId={undefined}
        rightShipId={undefined}
        leftComp={comp}
        rightComp={undefined}
        onLeftShipChange={() => {}}
        onRightShipChange={() => {}}
        onConfigChange={onConfigChange}
      />,
    );

    fireEvent.mouseDown(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "DoubleLine" }));

    expect(onConfigChange).toHaveBeenCalledWith({
      left: { formation: "DoubleLine", starshell_index: 0 },
      right: { formation: "Diamond" },
    });
    expect(config.left).toEqual({ formation: "LineAhead", starshell_index: 0 });
    expect(onConfigChange.mock.calls[0][0].right).toBe(config.right);
  });
});
