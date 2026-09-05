import { act, render, screen } from "@testing-library/react";
import React from "react";

import { ThemeProvider } from "../../../styles";

import NodeAttackDetails from "./NodeAttackDetails";

const analyzeNodeAttack = jest.fn((...args: unknown[]) => {
  void args;
  return {
    left: analysisStub(),
    right: analysisStub(),
    shelling_fleet_cutin: [],
    night_fleet_cutin: [],
  };
});

// hooks バレルは react-dnd (ESM) を巻き込むため、使う分だけ差し替える。
jest.mock("../../../hooks", () => ({
  useFhCore: () => ({ analyzer: { analyze_node_attack: analyzeNodeAttack } }),
  useShip: (id?: string) => (id ? { id, ship_id: 1 } : undefined),
  useShipName: (shipId: number) => `ship${shipId}`,
}));

jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: "ja" },
  }),
}));

// 比較の配線だけを見たいので、重い子は props を書き出すだけの stub にする。
let lastCompareShipId: string | undefined;
let onCompareShipChange: ((id: string | undefined) => void) | undefined;

jest.mock("./AttackReportDetails", () => ({
  __esModule: true,
  default: (props: {
    compareShipId?: string | undefined;
    onCompareShipChange?: ((id: string | undefined) => void) | undefined;
  }) => {
    if (props.onCompareShipChange) {
      lastCompareShipId = props.compareShipId;
      onCompareShipChange = props.onCompareShipChange;
    }
    return <div data-testid="report">{props.compareShipId ?? "none"}</div>;
  },
}));

jest.mock("./FleetCutinAnalysisTable", () => ({
  __esModule: true,
  default: () => null,
}));

function analysisStub() {
  const report = { is_active: true, damage_state_density: {}, data: {} };
  return {
    day: report,
    night: report,
    closing_torpedo: report,
    opening_asw: report,
    support_shelling: report,
  };
}

/** eid の並びだけを持つ最小の Comp。hasCompShip は meta() しか見ない。 */
function comp(ids: string[]) {
  return {
    meta: () => ({
      fleets: {
        Main: { ships: ids.map((id, i) => [i, { id, ship_id: 1 }]) },
      },
    }),
  } as never;
}

/** 左右2つ描くので、比較セレクタを持つ左だけを見る。 */
const leftReport = () => screen.getAllByTestId("report")[0];

/** analyze_node_attack の第3引数が攻撃艦。比較艦ぶんの呼び出しがあったか。 */
const analyzedWith = (id: string) =>
  analyzeNodeAttack.mock.calls.some(
    (call) => (call[2] as { id?: string } | undefined)?.id === id,
  );

const ship = (id: string) => ({ id, ship_id: 1, max_hp: 99, current_hp: 99 });

function renderWith(leftComp: never) {
  return render(
    <ThemeProvider>
      <NodeAttackDetails
        config={{} as never}
        leftComp={leftComp}
        leftShip={ship("a") as never}
        rightComp={comp(["x"])}
        rightShip={ship("x") as never}
      />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  analyzeNodeAttack.mockClear();
  lastCompareShipId = undefined;
  onCompareShipChange = undefined;
});

it("比較艦が編成から外れたら、比較解析も選択状態も解除する", () => {
  const { rerender } = renderWith(comp(["a", "b"]));

  act(() => onCompareShipChange?.("b"));
  expect(leftReport()).toHaveTextContent("b");

  // 比較艦ぶんの解析が走っていることを確かめてから編成を絞る。
  expect(analyzedWith("b")).toBe(true);

  analyzeNodeAttack.mockClear();

  rerender(
    <ThemeProvider>
      <NodeAttackDetails
        config={{} as never}
        leftComp={comp(["a"])}
        leftShip={ship("a") as never}
        rightComp={comp(["x"])}
        rightShip={ship("x") as never}
      />
    </ThemeProvider>,
  );

  // 外れた艦を渡した解析が残らないこと。
  expect(analyzedWith("b")).toBe(false);

  // 選択欄と解析状態が食い違わないこと。
  expect(leftReport()).toHaveTextContent("none");
  expect(lastCompareShipId).toBeUndefined();
});

it("編成に居るあいだは比較解析を続ける", () => {
  const { rerender } = renderWith(comp(["a", "b"]));

  act(() => onCompareShipChange?.("b"));
  analyzeNodeAttack.mockClear();

  rerender(
    <ThemeProvider>
      <NodeAttackDetails
        config={{} as never}
        leftComp={comp(["a", "b", "c"])}
        leftShip={ship("a") as never}
        rightComp={comp(["x"])}
        rightShip={ship("x") as never}
      />
    </ThemeProvider>,
  );

  expect(analyzedWith("b")).toBe(true);
  expect(leftReport()).toHaveTextContent("b");
});
