import { colors as muiColors } from "@mui/material";
import { render } from "@testing-library/react";
import React from "react";

import { ThemeProvider } from "../../../styles";
import type { DamageChartRow } from "../../../utils";

import DamageDensityTooltip from "./DamageDensityTooltip";

jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: "ja" },
  }),
}));

const row: DamageChartRow = {
  damage: 30,
  damageEnd: 30,
  state: "Chuuha",
  rate: 0.012,
  cumulative: 0.4,
  compareRate: null,
  compareCumulative: null,
  breakdown: [],
  scratch: 0,
  compareScratch: null,
  axisRate: 0.012,
};

function renderTooltip(props: Record<string, unknown> = {}) {
  const { container } = render(
    <ThemeProvider>
      <DamageDensityTooltip
        active
        payload={[{ payload: row }] as never}
        {...props}
      />
    </ThemeProvider>,
  );

  return container.firstElementChild as HTMLElement;
}

/** 系列の表は列で桁を合わせているので、1行 = 6セル。 */
function seriesCells(root: HTMLElement) {
  const grid = root.children[1];
  const cells = Array.from(grid.children).map((el) => el.textContent ?? "");
  const lines: string[][] = [];

  for (let i = 0; i < cells.length; i += 6) {
    lines.push(cells.slice(i, i + 6));
  }

  return lines;
}

it("損傷状態は名前ではなくダメージ値の色で示す", () => {
  const root = renderTooltip({ mainName: "#1 ship1" });

  expect(root.textContent).toContain("30");
  expect(root.textContent).toContain("1.20%");

  // 状態名を添えると1行目が長くなるうえ、色で足りる。
  expect(root.textContent).not.toContain("DamageState.Chuuha");

  // style 属性は jsdom が rgb() に正規化する。
  const heading = root.firstElementChild as HTMLElement;
  expect(heading.style.color).toBe("rgb(255, 152, 0)");
  expect(muiColors.orange[500]).toBe("#ff9800");
});

it("系列は「ダメージ発生確率」を省いて艦名から書き出す", () => {
  const root = renderTooltip({
    mainName: "#1 ship1",
    compareName: "#3 ship1",
    payload: [
      { payload: { ...row, compareRate: 0.02, compareCumulative: 0.6 } },
    ] as never,
  });

  expect((root.children[0] as HTMLElement).textContent).toBe("Damage 30");

  // どの系列も「ダメージ発生確率」なので、艦名だけで区別が付く。
  // 艦名の長さが揃わないので、桁は列で合わせる。
  expect(seriesCells(root)).toEqual([
    ["#1 ship1", "1.20%", "", "", "/ Cumulative", "40.0%"],
    ["#3 ship1", "2.00%", "", "", "/ Cumulative", "60.0%"],
  ]);
});

it("装甲貫通のぶんと割合のぶんに分けて出す", () => {
  const root = renderTooltip({
    mainName: "#1 ship1",
    payload: [{ payload: { ...row, scratch: 0.005 } }] as never,
  });

  // 棒と同じ分け方。0.70% + 0.50% = 1.20% がそのダメージ量の発生確率。
  expect(seriesCells(root)).toEqual([
    [
      "#1 ship1",
      "0.70%",
      "/ DamageDistribution.Scratch",
      "0.50%",
      "/ Cumulative",
      "40.0%",
    ],
  ]);
});

it("積み上げの内訳は他所と同じ攻撃種類の Chip で出す", () => {
  const root = renderTooltip({
    breakdownItems: [
      {
        label: "NightAttackType.DoubleAttack",
        style: { tag: "NightAttackStyle", attack_type: "DoubleAttack" },
      },
      { label: "DamageDistribution.Other", style: null },
    ],
    payload: [{ payload: { ...row, breakdown: [0.008, 0.004] } }] as never,
  });

  const chips = Array.from(root.querySelectorAll(".MuiChip-root"));
  expect(chips.map((el) => el.textContent)).toEqual([
    "NightAttackType.DoubleAttack",
    "DamageDistribution.Other",
  ]);

  // 種類のある行は AttackTypeChip と同じ色枠。
  expect(getComputedStyle(chips[0]).borderColor).toBe(muiColors.indigo[200]);
  expect(root.textContent).toContain("0.80%");
  expect(root.textContent).toContain("0.40%");
});

it("グラフの上でも読める背景を敷く", () => {
  const root = renderTooltip();

  // グラフに重なるので、background.paper（ほぼ透明）ではなく不透明な背景が要る。
  expect(getComputedStyle(root).background).toContain("rgba(30, 20, 20, 0.85)");
});
