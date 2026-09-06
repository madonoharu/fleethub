import { colors as muiColors } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { ThemeProvider } from "../../../styles";

import DamageDensitySection from "./DamageDensitySection";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverStub as never;

// ResponsiveContainer は jsdom では 0x0 になり中身を描画しないので固定サイズにする。
jest.mock("recharts", () => {
  const original = jest.requireActual<typeof import("recharts")>("recharts");

  return {
    ...original,
    ResponsiveContainer: ({ children }: { children: React.ReactElement }) =>
      React.cloneElement(children, { width: 600, height: 280 } as never),
  };
});

// hooks バレルは react-dnd (ESM) を巻き込むため、使う分だけ差し替える。
// 表示設定は store に置いてある。購読と dispatch だけを持つ最小の store で代える。
const listeners = new Set<() => void>();
let appState: { damageDensityIncludeScratch?: boolean } = {};

const dispatch = jest.fn((action: { type: string; payload: boolean }) => {
  if (action.type === "app/setDamageDensityIncludeScratch") {
    appState = { ...appState, damageDensityIncludeScratch: action.payload };
    listeners.forEach((notify) => notify());
  }
});

jest.mock("../../../hooks", () => ({
  useShipName: (shipId: number) => `ship${shipId}`,
  useAppDispatch: () => dispatch,
  useRootSelector: (selector: (root: unknown) => unknown) => {
    const [, force] = React.useReducer((n: number) => n + 1, 0);

    React.useEffect(() => {
      listeners.add(force);
      return () => {
        listeners.delete(force);
      };
    }, [force]);

    return selector({ app: appState });
  },
}));

beforeEach(() => {
  dispatch.mockClear();
  appState = {};
});

jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: "ja" },
  }),
}));

// 比較していないときは攻撃種類で積むので、種類名が凡例に出る。
const report = {
  data: {
    a: {
      proc_rate: 0.4,
      style: { tag: "NightAttackStyle", attack_type: "SingleAttack" },
      damage: { damage_density: { 0: 0.5, 90: 0.5 } },
    },
    b: {
      proc_rate: 0.6,
      style: { tag: "NightAttackStyle", attack_type: "DoubleAttack" },
      damage: { damage_density: { 0: 0.5, 30: 0.5 } },
    },
  },
} as never;

function renderSection() {
  return render(
    <ThemeProvider>
      <DamageDensitySection
        report={report}
        targetMaxHp={99}
        targetCurrentHp={99}
      />
    </ThemeProvider>,
  );
}

it("中央値と上位5%は数値ではなく破線だけで示す", () => {
  const { container } = renderSection();

  // 図の中に置くと互いに重なるので、値はツールチップに任せる。
  expect(container.textContent).not.toContain("DamageDistribution.Median");
  expect(container.textContent).not.toContain("DamageDistribution.Upper5");

  const dashed = Array.from(
    container.querySelectorAll(".recharts-reference-line line"),
  ).filter((el) => el.getAttribute("stroke-dasharray"));

  expect(dashed).toHaveLength(2);
});

it("損傷状態以上になる確率を損傷状態の色つきで並べる", () => {
  const { container } = renderSection();

  // 撃沈行がそのまま撃破率にあたる。
  expect(container.textContent).toContain("DamageState.Sunk");

  const dots = Array.from(
    container.querySelectorAll("span[style*='background']"),
  )
    .map((el) => (el as HTMLElement).style.background)
    .filter(Boolean);

  // jsdom は background を rgb() に正規化する。
  expect(dots).toEqual(
    [
      muiColors.yellow[500],
      muiColors.orange[500],
      muiColors.red[500],
      muiColors.blue[500],
    ].map(toRgb),
  );
});

function toRgb(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}

function fillsOf(container: HTMLElement, selector: string) {
  return Array.from(container.querySelectorAll(selector))
    .map((el) => el.getAttribute("fill"))
    .filter((fill): fill is string => Boolean(fill));
}

it("残耐久に応じて損傷状態の帯と目盛が動く", () => {
  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection
        report={report}
        targetMaxHp={99}
        targetCurrentHp={40}
      />
    </ThemeProvider>,
  );

  const ticks = Array.from(
    container.querySelectorAll(".recharts-xAxis .recharts-cartesian-axis-tick"),
  ).map((el) => el.textContent);

  // 耐久99・残耐久40 はすでに中破。大破ライン24 まで16、撃沈まで40。
  expect(ticks).toEqual(["0", "16", "40", "90"]);
  expect(fillsOf(container, ".recharts-reference-area path")).toEqual([
    muiColors.orange[500],
    muiColors.red[500],
    muiColors.blue[500],
  ]);
});

it("損傷状態を背景の帯で示す", () => {
  const { container } = renderSection();

  const fills = fillsOf(container, ".recharts-reference-area path");

  // 残耐久99・耐久99 なので境界は 0/25/50/75/99。撃沈帯は 99 ダメージ以上で、
  // この分布は 90 までしか届かないので立たない。
  expect(fills).toEqual([
    muiColors.green[500],
    muiColors.yellow[500],
    muiColors.orange[500],
    muiColors.red[500],
  ]);
});

it("損傷状態の名前は帯の中央に置き、帯の範囲に罫を引く", () => {
  const { container } = renderSection();

  const zones = Array.from(
    container.querySelectorAll(".recharts-reference-area"),
  );

  expect(zones.length).toBeGreaterThan(0);

  zones.forEach((zone) => {
    const text = zone.querySelector("text");
    const rule = zone.querySelector("g line");

    expect(rule).not.toBeNull();

    const x1 = Number(rule?.getAttribute("x1"));
    const x2 = Number(rule?.getAttribute("x2"));

    // 罫は帯の幅ぶん引く。
    expect(x2).toBeGreaterThan(x1);

    // 名前は罫の中央。狭くて名前を出せない帯は罫だけになる。
    if (text) {
      expect(text.getAttribute("text-anchor")).toBe("middle");
      expect(Number(text.getAttribute("x"))).toBeCloseTo((x1 + x2) / 2, 0);
    }
  });
});

it("X軸の目盛を損傷状態の境界値に置く", () => {
  const { container } = renderSection();

  const ticks = Array.from(
    container.querySelectorAll(".recharts-xAxis .recharts-cartesian-axis-tick"),
  ).map((el) => el.textContent);

  // 小破25 / 中破50 / 大破75 / 撃沈99 に必要なダメージ。90 は分布の右端。
  expect(ticks).toEqual(["0", "25", "50", "75", "90"]);
});

it("点数が多いときは棒ではなく1本のパスで描く", () => {
  // 棒を1本ずつ SVG 要素にすると本数に比例して重くなるので、
  // 棒として読めない密度になったら階段状の面グラフに切り替える。
  const density: Record<number, number> = {};
  for (let damage = 0; damage <= 300; damage++) {
    density[damage] = 1 / 301;
  }

  const wide = {
    data: { a: { proc_rate: 1, damage: { damage_density: density } } },
  } as never;

  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection
        report={wide}
        targetMaxHp={400}
        targetCurrentHp={400}
      />
    </ThemeProvider>,
  );

  expect(container.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(0);
  expect(container.querySelectorAll(".recharts-area-area")).toHaveLength(1);
});

it("ダメージ0 の棒が桁違いなら軸を二段に切り、頭だけ上段に逃がす", () => {
  const spiky = {
    data: {
      a: {
        proc_rate: 1,
        damage: { damage_density: { 0: 0.8, 30: 0.05, 60: 0.15 } },
      },
    },
  } as never;

  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection
        report={spiky}
        targetMaxHp={99}
        targetCurrentHp={99}
      />
    </ThemeProvider>,
  );

  const ticks = Array.from(
    container.querySelectorAll(
      ".recharts-yAxis .recharts-cartesian-axis-tick text",
    ),
  );

  // 下段はダメージ0 の 80% ではなく、それを除いたピーク 15% に合わせる。
  // 上段は 80% を挟むきりのいい窓。
  expect(ticks.slice(0, 6).map((el) => el.textContent)).toEqual([
    "0.0%",
    "5.0%",
    "10.0%",
    "15.0%",
    "60%",
    "100%",
  ]);

  const yOf = (el: Element | undefined) => Number(el?.getAttribute("y"));

  // 実値は上段の窓の中、2本の目盛の間。
  const mark = container.querySelector(".recharts-reference-dot text");
  expect(mark?.textContent).toBe("80.0%");
  expect(yOf(mark ?? undefined)).toBeLessThan(yOf(ticks[4]));
  expect(yOf(mark ?? undefined)).toBeGreaterThan(yOf(ticks[5]));

  // 切れ目の波線は上下2本。
  const waves = container.querySelectorAll(".recharts-reference-area g path");
  expect(waves.length).toBe(2);

  // ダメージ0 の棒。下から本体・切れ目（透明）・頭の3段。
  const rectOf = (el: Element) => {
    const m = /M ([\d.]+),([\d.]+) h ([\d.]+) v ([\d.]+)/.exec(
      el.getAttribute("d") ?? "",
    );

    return {
      x: Number(m?.[1]),
      y: Number(m?.[2]),
      width: Number(m?.[3]),
      height: Number(m?.[4]),
      fill: el.getAttribute("fill"),
    };
  };

  const rects = Array.from(
    container.querySelectorAll(".recharts-bar-rectangle path"),
  ).map(rectOf);

  const left = Math.min(...rects.map((r) => r.x));
  const stack = rects.filter((r) => r.x === left).sort((a, b) => a.y - b.y);

  expect(stack).toHaveLength(3);

  const [head, gap, bodyBar] = stack;

  // 頭は分布と同じ積み上げに載せるので、位置も幅も本体とそのまま揃う。
  expect(head.x).toBe(bodyBar.x);
  expect(head.width).toBe(bodyBar.width);

  // 間は透明な段で空ける。
  expect(gap.fill).toBe("none");
  expect(head.y + head.height).toBeCloseTo(gap.y, 5);
  expect(gap.y + gap.height).toBeCloseTo(bodyBar.y, 5);
  expect(gap.height).toBeGreaterThan(0);
});

it("比較していないときは攻撃種類で積む", () => {
  const styled = {
    data: {
      a: {
        proc_rate: 0.4,
        style: { tag: "NightAttackStyle", attack_type: "SingleAttack" },
        damage: { damage_density: { 0: 0.5, 90: 0.5 } },
      },
      b: {
        proc_rate: 0.6,
        style: { tag: "NightAttackStyle", attack_type: "DoubleAttack" },
        damage: { damage_density: { 0: 0.5, 30: 0.5 } },
      },
    },
  } as never;

  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection
        report={styled}
        targetMaxHp={99}
        targetCurrentHp={99}
      />
    </ThemeProvider>,
  );

  // 種類ぶんの系列になり、青の明度ランプで塗り分ける。
  // 2段なのでランプの両端を使う。
  const fills = fillsOf(container, ".recharts-bar-rectangle path");
  expect(new Set(fills)).toEqual(
    new Set([muiColors.lightBlue[800], muiColors.lightBlue[400]]),
  );

  // 凡例に種類名と累計線が並ぶ。
  const legend = container.querySelector(".recharts-legend-wrapper");
  expect(legend?.textContent).toContain("NightAttackType.SingleAttack");
  expect(legend?.textContent).toContain("NightAttackType.DoubleAttack");
  expect(legend?.textContent).toContain("DamageDistribution.Cumulative");
});

it("種類が多いときは「その他」をランプから外して積む", () => {
  const attacks = [
    "SingleAttack",
    "DoubleAttack",
    "MainMain",
    "MainRadar",
    "MainAp",
  ];

  const many = {
    data: Object.fromEntries(
      // 発動率が小さいものほど下。上位4種類 ＋ その他になる。
      attacks.map((attack_type, i) => [
        attack_type,
        {
          proc_rate: 0.05 * (i + 1),
          style: { tag: "NightAttackStyle", attack_type },
          damage: { damage_density: { 0: 0.5, [10 * (i + 1)]: 0.5 } },
        },
      ]),
    ),
  } as never;

  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection
        report={many}
        targetMaxHp={99}
        targetCurrentHp={99}
      />
    </ThemeProvider>,
  );

  // 軸の切れ目ぶんの透明な段は色ではないので除く。
  const fills = new Set(
    fillsOf(container, ".recharts-bar-rectangle path").filter(
      (fill) => fill !== "none",
    ),
  );

  // まとめた「その他」をランプの中に置くと明るさの順が壊れるので、
  // 彩度を落とした1色を別に当てる。残る4段は端の2色を等分して作る。
  expect(fills).toEqual(
    new Set([
      muiColors.blueGrey[500],
      muiColors.lightBlue[800],
      "#0f8cd0",
      "#1ca1e3",
      muiColors.lightBlue[400],
    ]),
  );

  // 上端は lightBlue400 まで。これより明るくすると紺の下地から浮く。
  expect(fills.has(muiColors.lightBlue[300])).toBe(false);
});

it("段が増えても端の色は変わらず、間だけが割り当てられる", () => {
  const typed = (count: number) =>
    ({
      data: Object.fromEntries(
        Array.from({ length: count }, (_, i) => [
          `a${i}`,
          {
            proc_rate: 0.1 * (i + 1),
            style: { tag: "NightAttackStyle", attack_type: `T${i}` },
            damage: { damage_density: { 0: 0.5, [10 * (i + 1)]: 0.5 } },
          },
        ]),
      ),
    }) as never;

  const fillsFor = (count: number) => {
    const { container, unmount } = render(
      <ThemeProvider>
        <DamageDensitySection
          report={typed(count)}
          targetMaxHp={99}
          targetCurrentHp={99}
        />
      </ThemeProvider>,
    );

    const found = new Set(
      fillsOf(container, ".recharts-bar-rectangle path").filter(
        (fill) => fill !== "none",
      ),
    );
    unmount();

    return found;
  };

  const dark = muiColors.lightBlue[800];
  const light = muiColors.lightBlue[400];

  // 段が2つなら端の2色だけ。使える幅は段の数によらないので、
  // 少ないからといって暗い側へ寄せたりしない。
  expect(fillsFor(2)).toEqual(new Set([dark, light]));

  // 3つなら間にちょうど中間の1色が入る。
  expect(fillsFor(3)).toEqual(new Set([dark, "#1697da", light]));

  // 4つでも端は同じ。
  const four = fillsFor(4);
  expect(four.size).toBe(4);
  expect(four.has(dark)).toBe(true);
  expect(four.has(light)).toBe(true);
});

it("損傷状態の名前は図の外、罫は境界に重ねる", () => {
  const { container } = renderSection();

  // 損傷帯の矩形の上辺がプロット領域の上端＝境界。
  const zone = container.querySelector(".recharts-reference-area path");
  const plotTop = Number(
    /M\s*[\d.]+,([\d.]+)/.exec(zone?.getAttribute("d") ?? "")?.[1],
  );

  expect(plotTop).toBeGreaterThan(0);

  const zoneNames = Array.from(
    container.querySelectorAll(".recharts-reference-area text"),
  );

  expect(zoneNames.length).toBeGreaterThan(0);

  // 名前は境界の上、つまり図の外。
  zoneNames.forEach((el) => {
    expect(Number(el.getAttribute("y"))).toBeLessThan(plotTop);
  });

  // 罫は境界そのものに重ねる。
  Array.from(
    container.querySelectorAll(".recharts-reference-area g line"),
  ).forEach((el) => {
    expect(Number(el.getAttribute("y1"))).toBeCloseTo(plotTop, 5);
  });
});

it("単系列でも凡例を出す", () => {
  const single = {
    data: {
      a: {
        proc_rate: 1,
        style: { tag: "NightAttackStyle", attack_type: "SingleAttack" },
        damage: { damage_density: { 0: 0.5, 90: 0.5 } },
      },
    },
  } as never;

  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection
        report={single}
        targetMaxHp={99}
        targetCurrentHp={99}
      />
    </ThemeProvider>,
  );

  const rows = Array.from(
    container.querySelectorAll(".recharts-legend-wrapper span"),
  ).map((el) => el.textContent);

  // 棒と線が何を指すかは、系列が1つでも図からは分からない。
  expect(rows).toEqual([
    "NightAttackType.SingleAttack",
    "DamageDistribution.Cumulative",
  ]);
});

it("比較しているときは割合を塗り分けず、段としては残す", () => {
  const withScratch = (scratch: number) =>
    ({
      proc_rate: 1,
      damage: {
        damage_density: { 0: 0.4, 8: scratch, 60: 0.6 - scratch },
        damage_density_scratch_only: { 8: scratch },
      },
    }) as never;

  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection
        report={{ data: { a: withScratch(0.2) } } as never}
        targetMaxHp={99}
        targetCurrentHp={99}
        attackerShipName="ship1"
        compareReport={{ data: { a: withScratch(0.1) } } as never}
        compareShipName="ship2"
      />
    </ThemeProvider>,
  );

  const rows = Array.from(
    container.querySelectorAll(".recharts-legend-wrapper span"),
  ).map((el) => el.textContent);

  // 塗り分けていないので、凡例に出しても示す色がない。艦名だけを並べる。
  expect(rows).toEqual(["ship1", "ship2"]);

  const fills = () =>
    new Set(fillsOf(container, ".recharts-bar-rectangle path"));

  // 棒が2本並んでいるところをさらに塗り分けると、どちらの割合か読めなくなる。
  // 艦の色のまま積むので、図に出る色は艦の数だけ。
  expect(fills()).toEqual(
    new Set([muiColors.lightBlue[700], muiColors.pink[400]]),
  );

  const bars = () => fillsOf(container, ".recharts-bar-rectangle path").length;
  const before = bars();

  // 色は同じでも段としては別なので、チェックボックスで外せる。
  fireEvent.click(screen.getByLabelText("DamageDistribution.Scratch"));

  expect(bars()).toBeLessThan(before);
  expect(fills()).toEqual(
    new Set([muiColors.lightBlue[700], muiColors.pink[400]]),
  );
});

it("比較を選ぶと積み上げをやめて艦ごとの2本にする", () => {
  const styled = {
    data: {
      a: {
        proc_rate: 0.4,
        style: { tag: "NightAttackStyle", attack_type: "SingleAttack" },
        damage: { damage_density: { 0: 0.5, 90: 0.5 } },
      },
      b: {
        proc_rate: 0.6,
        style: { tag: "NightAttackStyle", attack_type: "DoubleAttack" },
        damage: { damage_density: { 0: 0.5, 30: 0.5 } },
      },
    },
  } as never;

  const compareReport = {
    data: {
      a: { proc_rate: 1, damage: { damage_density: { 0: 0.5, 40: 0.5 } } },
    },
  } as never;

  const { container, rerender } = render(
    <ThemeProvider>
      <DamageDensitySection
        report={styled}
        targetMaxHp={99}
        targetCurrentHp={99}
      />
    </ThemeProvider>,
  );

  const fills = () =>
    new Set(fillsOf(container, ".recharts-bar-rectangle path"));

  expect(fills()).toEqual(
    new Set([muiColors.lightBlue[800], muiColors.lightBlue[400]]),
  );

  rerender(
    <ThemeProvider>
      <DamageDensitySection
        report={styled}
        targetMaxHp={99}
        targetCurrentHp={99}
        compareReport={compareReport}
      />
    </ThemeProvider>,
  );

  // 積み上げと重ね合わせ比較は同じ棒を取り合う。艦の青と赤だけになる。
  expect(fills()).toEqual(
    new Set([muiColors.lightBlue[700], muiColors.pink[400]]),
  );
});

it("比較の有無で操作が入れ替わらない", () => {
  const compareReport = {
    data: {
      a: { proc_rate: 1, damage: { damage_density: { 0: 0.5, 40: 0.5 } } },
    },
  } as never;

  const { rerender } = render(
    <ThemeProvider>
      <DamageDensitySection
        report={report}
        targetMaxHp={99}
        targetCurrentHp={99}
      />
    </ThemeProvider>,
  );

  // 操作は「比較」と「割合」だけ。比較を選んでも出入りしないので、
  // 切り替えるたびに図が上下に動くことがない。
  const scratch = () => screen.getByLabelText("DamageDistribution.Scratch");

  // 既定は算入。
  expect(scratch()).toHaveProperty("checked", true);

  rerender(
    <ThemeProvider>
      <DamageDensitySection
        report={report}
        targetMaxHp={99}
        targetCurrentHp={99}
        compareReport={compareReport}
      />
    </ThemeProvider>,
  );

  expect(scratch()).toHaveProperty("checked", true);
});

it("凡例は1行で、項目が増えても図の高さを変えない", () => {
  const report = {
    data: {
      a: {
        proc_rate: 0.4,
        style: { tag: "NightAttackStyle", attack_type: "SingleAttack" },
        damage: { damage_density: { 0: 0.6, 60: 0.4 } },
      },
      b: {
        proc_rate: 0.6,
        style: { tag: "NightAttackStyle", attack_type: "DoubleAttack" },
        damage: { damage_density: { 0: 0.4, 8: 0.2, 60: 0.4 } },
      },
    },
  } as never;

  const compareReport = {
    data: {
      a: { proc_rate: 1, damage: { damage_density: { 0: 0.5, 40: 0.5 } } },
    },
  } as never;

  const { container, rerender } = render(
    <ThemeProvider>
      <DamageDensitySection
        report={report}
        targetMaxHp={99}
        targetCurrentHp={99}
      />
    </ThemeProvider>,
  );

  const legend = () =>
    container.querySelector(".recharts-legend-wrapper > div") as HTMLElement;
  const plotHeight = () =>
    container
      .querySelector(".recharts-cartesian-grid line")
      ?.getAttribute("y1");

  expect(legend().style.flexWrap).toBe("nowrap");
  expect(legend().style.height).toBe("22px");

  const before = { rows: legend().children.length, plot: plotHeight() };
  expect(before.rows).toBe(3);

  rerender(
    <ThemeProvider>
      <DamageDensitySection
        report={report}
        targetMaxHp={99}
        targetCurrentHp={99}
        compareReport={compareReport}
      />
    </ThemeProvider>,
  );

  // 項目数が変わっても、凡例の高さは同じなので図が伸び縮みしない。
  expect(legend().children.length).not.toBe(before.rows);
  expect(legend().style.height).toBe("22px");
  expect(plotHeight()).toBe(before.plot);
});

it("凡例を押すとその系列を消せる", () => {
  const { container } = renderSection();

  const bars = () =>
    container.querySelectorAll(".recharts-bar-rectangle path").length;
  const lines = () => container.querySelectorAll(".recharts-line-curve").length;

  expect(bars()).toBeGreaterThan(0);
  expect(lines()).toBe(1);

  fireEvent.click(screen.getByText("DamageDistribution.Cumulative"));
  expect(lines()).toBe(0);
  expect(bars()).toBeGreaterThan(0);

  fireEvent.click(screen.getByText("NightAttackType.SingleAttack"));
  fireEvent.click(screen.getByText("NightAttackType.DoubleAttack"));
  expect(bars()).toBe(0);

  // もう一度押すと戻る。
  fireEvent.click(screen.getByText("NightAttackType.SingleAttack"));
  expect(bars()).toBeGreaterThan(0);
});

it("比較しているときは凡例を艦名で分ける", () => {
  const compareReport = {
    data: {
      a: { proc_rate: 1, damage: { damage_density: { 0: 0.5, 40: 0.5 } } },
    },
  } as never;

  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection
        report={report}
        targetMaxHp={99}
        targetCurrentHp={99}
        attackerShipName="ship1"
        compareReport={compareReport}
        compareShipName="ship2"
      />
    </ThemeProvider>,
  );

  const legend = container.querySelector(".recharts-legend-wrapper");
  const rows = Array.from(legend?.querySelectorAll("span") ?? []).map(
    (el) => el.textContent,
  );

  // 既定の凡例だと「艦A / 艦B / 累計確率 / 累計確率(艦B)」の4項目になる。
  // 分布（塗り）と累計（線）は艦ごとに1項目へまとめ、見出しは艦名だけにする。
  expect(rows).toEqual(["ship1", "ship2"]);
});

it("累計確率の線は自分の棒と同じ色相にし、どちらも実線で引く", () => {
  const compareReport = {
    data: {
      a: { proc_rate: 1, damage: { damage_density: { 0: 0.5, 40: 0.5 } } },
    },
  } as never;

  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection
        report={report}
        targetMaxHp={99}
        targetCurrentHp={99}
        attackerShipName="ship1"
        compareReport={compareReport}
        compareShipName="ship2"
      />
    </ThemeProvider>,
  );

  const lines = Array.from(
    container.querySelectorAll(".recharts-line-curve"),
  ).map((el) => ({
    stroke: el.getAttribute("stroke"),
    dash: el.getAttribute("stroke-dasharray"),
  }));

  // 色相はどちらの艦か、明るさは棒か線かを表す。
  // 補色を当てると相手の棒のほうが近くなり、襷掛けに見えてしまう。
  expect(lines.map((line) => line.stroke)).toEqual([
    muiColors.lightBlue[200],
    muiColors.pink[200],
  ]);

  // 色で分かれるので、破線にはしない。
  expect(lines.map((line) => line.dash)).toEqual([null, null]);

  // 凡例でも艦ごとに線の色が違う。
  const strokes = Array.from(
    container.querySelectorAll(".recharts-legend-wrapper line"),
  ).map((el) => el.getAttribute("stroke"));

  expect(strokes).toEqual([muiColors.lightBlue[200], muiColors.pink[200]]);
});

it("比較していないときの累計線は棒の補色にする", () => {
  const { container } = renderSection();

  // 線が1本なら、どちらの艦かを示す必要がない。棒の系統から離して
  // 「確率の量ではなく右軸の補助線」だと分かるようにする。
  const strokes = Array.from(
    container.querySelectorAll(".recharts-line-curve"),
  ).map((el) => el.getAttribute("stroke"));

  expect(strokes).toEqual([muiColors.orange[300]]);
});

it("割合を外すと、その質量だけ棒が低くなる", () => {
  const report = {
    data: {
      a: {
        proc_rate: 1,
        style: { tag: "NightAttackStyle", attack_type: "SingleAttack" },
        damage: {
          // ダメージ8 の 0.2 のうち 0.15 は全弾が割合ダメージだったぶん。
          damage_density: { 0: 0.4, 8: 0.2, 60: 0.4 },
          damage_density_scratch_only: { 8: 0.15 },
        },
      },
    },
  } as never;

  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection
        report={report}
        targetMaxHp={99}
        targetCurrentHp={99}
      />
    </ThemeProvider>,
  );

  const heightAt = (x: number) => {
    const rects = Array.from(
      container.querySelectorAll(".recharts-bar-rectangle path"),
    ).map((el) => {
      const m = /M ([\d.]+),[\d.]+ h [\d.]+ v ([\d.]+)/.exec(
        el.getAttribute("d") ?? "",
      );
      return { x: Number(m?.[1]), height: Number(m?.[2]) };
    });

    return rects.sort((a, b) => a.x - b.x)[x]?.height ?? 0;
  };

  const scratch = () => screen.getByLabelText("DamageDistribution.Scratch");

  // 既定は算入。ダメージ8 の棒は 0.2 ぶん。
  expect(scratch()).toHaveProperty("checked", true);
  const before = { zero: heightAt(0), eight: heightAt(1) };

  fireEvent.click(scratch());

  // 全弾が割合だったぶんが落ちて 0.05 になる。他のビンは動かない。
  expect(heightAt(1) / before.eight).toBeCloseTo(0.05 / 0.2, 5);
  expect(heightAt(0)).toBeCloseTo(before.zero, 5);
});

it("割合を外すと図全体がその分布に切り替わる", () => {
  const report = {
    data: {
      a: {
        proc_rate: 1,
        style: { tag: "NightAttackStyle", attack_type: "SingleAttack" },
        damage: {
          // ダメージ8 の 0.3 はすべて全弾が割合ダメージだったぶん。
          damage_density: { 0: 0.3, 8: 0.3, 60: 0.4 },
          damage_density_scratch_only: { 8: 0.3 },
        },
      },
    },
  } as never;

  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection
        report={report}
        targetMaxHp={99}
        targetCurrentHp={99}
      />
    </ThemeProvider>,
  );

  // 中央値の破線。棒だけでなく代表値も同じ分布から作る。
  const medianX = () =>
    container
      .querySelector(".recharts-reference-line line")
      ?.getAttribute("x1");

  // 累計線の右端。算入しないと総和が 1 未満になるので 100% に届かない。
  const cumulativeEnd = () => {
    const d =
      container.querySelector(".recharts-line-curve")?.getAttribute("d") ?? "";
    return Number(/([\d.]+)$/.exec(d)?.[1]);
  };

  const before = { median: medianX(), end: cumulativeEnd() };

  fireEvent.click(screen.getByLabelText("DamageDistribution.Scratch"));

  // 割合ダメージが中央値を作っていたので、外すと右へ動く。
  expect(medianX()).not.toBe(before.median);
  // 累計線の終点は下がる（＝軸の下のほうへ動くので y は大きくなる）。
  expect(cumulativeEnd()).toBeGreaterThan(before.end);
});

it("割合の算入を切り替えても軸は動かない", () => {
  const report = {
    data: {
      a: {
        proc_rate: 1,
        style: { tag: "NightAttackStyle", attack_type: "SingleAttack" },
        damage: {
          // 山の頂点（ダメージ8 の 0.5）のほとんどが割合ダメージ。
          // 軸を描く分布から決めていると、外したとたんに縦軸が縮む。
          damage_density: { 0: 0.1, 8: 0.5, 60: 0.4 },
          damage_density_scratch_only: { 8: 0.45 },
        },
      },
    },
  } as never;

  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection
        report={report}
        targetMaxHp={99}
        targetCurrentHp={99}
      />
    </ThemeProvider>,
  );

  const ticksOf = (selector: string) =>
    Array.from(
      container.querySelectorAll(`${selector} .recharts-cartesian-axis-tick`),
    ).map((el) => el.textContent);

  const before = {
    rate: ticksOf(".recharts-yAxis"),
    damage: ticksOf(".recharts-xAxis"),
  };

  expect(before.rate.length).toBeGreaterThan(1);

  fireEvent.click(screen.getByLabelText("DamageDistribution.Scratch"));

  // 算入あり・なしを見比べるための操作なので、目盛が変わっては意味がない。
  expect(ticksOf(".recharts-yAxis")).toEqual(before.rate);
  expect(ticksOf(".recharts-xAxis")).toEqual(before.damage);
});

it("凡例の on/off は攻撃種類で覚える", () => {
  const typed = (procRates: number[]) =>
    ({
      data: Object.fromEntries(
        procRates.map((proc_rate, i) => [
          `T${i}`,
          {
            proc_rate,
            style: { tag: "NightAttackStyle", attack_type: `T${i}` },
            damage: { damage_density: { 0: 0.5, [20 * (i + 1)]: 0.5 } },
          },
        ]),
      ),
    }) as never;

  // 積む順は発動率の小さいものから。T0 が下、T1 が上。
  const { container, rerender } = render(
    <ThemeProvider>
      <DamageDensitySection
        report={typed([0.3, 0.7])}
        targetMaxHp={99}
        targetCurrentHp={99}
      />
    </ThemeProvider>,
  );

  const fillsNow = () =>
    new Set(
      fillsOf(container, ".recharts-bar-rectangle path").filter(
        (fill) => fill !== "none",
      ),
    );

  fireEvent.click(screen.getByText("NightAttackType.T0"));
  expect(fillsNow().size).toBe(1);

  // 発動率が入れ替わると積む順も入れ替わる。添字で覚えていると、
  // 消したはずの T0 ではなく T1 が消えたままになる。
  rerender(
    <ThemeProvider>
      <DamageDensitySection
        report={typed([0.7, 0.3])}
        targetMaxHp={99}
        targetCurrentHp={99}
      />
    </ThemeProvider>,
  );

  const hiddenLabel = Array.from(
    container.querySelectorAll(".recharts-legend-wrapper > div > *"),
  ).find((el) => (el as HTMLElement).style.opacity === "0.35")?.textContent;

  expect(hiddenLabel).toBe("NightAttackType.T0");
});

it("凡例の艦名に編成順を添える", () => {
  const compareReport = {
    data: {
      a: { proc_rate: 1, damage: { damage_density: { 0: 0.5, 40: 0.5 } } },
    },
  } as never;

  // 1番艦と3番艦が同じ艦。艦名だけではどちらの系列か分からない。
  const comp = {
    meta: () => ({
      fleets: {
        Main: {
          ships: [
            ["s1", { id: "a", ship_id: 1 }],
            ["s2", null],
            ["s3", { id: "b", ship_id: 1 }],
          ],
        },
      },
    }),
  } as never;

  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection
        report={report}
        targetMaxHp={99}
        targetCurrentHp={99}
        comp={comp}
        attackerShipId="a"
        attackerShipName="ship1"
        compareShipId="b"
        compareReport={compareReport}
        compareShipName="ship1"
      />
    </ThemeProvider>,
  );

  const legend = container.querySelector(".recharts-legend-wrapper");
  const rows = Array.from(legend?.querySelectorAll("span") ?? []).map(
    (el) => el.textContent,
  );

  // 空き枠も数えて、画面上の「何番艦」と一致させる。
  expect(rows).toEqual(["#1 ship1", "#3 ship1"]);
});

it("点が多くてパスで描くとき、継ぎ足した段の輪郭を残さない", () => {
  const density: Record<number, number> = { 0: 0.8 };
  for (let damage = 1; damage <= 200; damage++) density[damage] = 0.2 / 200;

  const many = {
    data: { a: { proc_rate: 1, damage: { damage_density: density } } },
  } as never;

  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection
        report={many}
        targetMaxHp={999}
        targetCurrentHp={999}
      />
    </ThemeProvider>,
  );

  // 棒ではなくパスで描く本数。
  expect(container.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(0);

  // 本体・切れ目・頭の3段。
  expect(container.querySelectorAll(".recharts-area-area")).toHaveLength(3);

  // 継ぎ足した2段はダメージ0 以外で高さ0 なので、輪郭を描くと
  // ダメージ1 の位置に縦線だけが残る。輪郭は本体の1本だけにする。
  expect(container.querySelectorAll(".recharts-area-curve")).toHaveLength(1);
});

it("重ねているときは軸を切らず、実値を系列の色で並べる", () => {
  const spiky = {
    data: {
      a: {
        proc_rate: 1,
        damage: { damage_density: { 0: 0.8, 30: 0.05, 60: 0.15 } },
      },
    },
  } as never;
  const compareReport = {
    data: {
      a: {
        proc_rate: 1,
        damage: { damage_density: { 0: 0.7, 40: 0.1, 60: 0.2 } },
      },
    },
  } as never;

  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection
        report={spiky}
        targetMaxHp={99}
        targetCurrentHp={99}
        attackerShipName="ship1"
        compareReport={compareReport}
        compareShipName="ship2"
      />
    </ThemeProvider>,
  );

  // 2本の棒が同じビンを分け合うので、上段に頭を継ぎ足すとどちらの続きか
  // 分からなくなる。切らずに、実値だけを系列の色で並べる。
  const marks = Array.from(
    container.querySelectorAll(".recharts-reference-dot text"),
  );

  expect(marks.map((el) => el.textContent)).toEqual(["80.0%", "70.0%"]);
  expect(marks[0].getAttribute("fill")).not.toBe(marks[1].getAttribute("fill"));
  expect(Number(marks[0].getAttribute("y"))).toBeLessThan(
    Number(marks[1].getAttribute("y")),
  );

  // 切れ目は作らない。
  expect(
    container.querySelectorAll(".recharts-reference-area g path").length,
  ).toBe(0);
});

it("両端の棒が縦軸の目盛にはみ出さない", () => {
  // 点が少ないと棒が太くなり、ダメージ値を中心に描くと端の棒が半分はみ出す。
  const narrow = {
    data: {
      a: {
        proc_rate: 1,
        damage: {
          damage_density: { 0: 0.39, 25: 0.2, 28: 0.2, 31: 0.21 },
        },
      },
    },
  } as never;

  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection
        report={narrow}
        targetMaxHp={99}
        targetCurrentHp={40}
      />
    </ThemeProvider>,
  );

  const grid = container.querySelector(
    ".recharts-cartesian-grid-horizontal line",
  );
  const plotLeft = Number(grid?.getAttribute("x1"));
  const plotRight = Number(grid?.getAttribute("x2"));

  expect(plotLeft).toBeGreaterThan(0);

  const bars = Array.from(
    container.querySelectorAll(".recharts-bar-rectangle path"),
  ).map((el) => {
    const d = el.getAttribute("d") ?? "";
    const left = Number(/M\s*([\d.]+),/.exec(d)?.[1]);
    const width = Number(/h\s*([\d.]+)/.exec(d)?.[1]);
    return { left, right: left + width };
  });

  expect(bars.length).toBeGreaterThan(0);

  bars.forEach(({ left, right }) => {
    expect(left).toBeGreaterThanOrEqual(plotLeft);
    expect(right).toBeLessThanOrEqual(plotRight);
  });
});

it("割合を算入するかはタブをまたいでも保つ", () => {
  const scratch = () => screen.getByRole("checkbox", { name: /Scratch/ });

  // 未設定なら算入。
  const { unmount } = renderSection();
  expect(scratch()).toBeChecked();

  fireEvent.click(scratch());
  expect(dispatch).toHaveBeenCalledWith({
    type: "app/setDamageDensityIncludeScratch",
    payload: false,
  });

  // タブを移ってアンマウントされても、開き直したときに残っていること。
  unmount();
  renderSection();
  expect(scratch()).not.toBeChecked();
});
