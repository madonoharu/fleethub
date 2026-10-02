import { beforeEach, it, expect, mock } from "bun:test";
import { colors as muiColors } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { ThemeProvider } from "../../../styles";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverStub as never;

// DOM エミュレータはレイアウトを計算しないので固定サイズにする。
const original = await import("recharts");
await mock.module("recharts", () => {
  return {
    ...original,
    ResponsiveContainer: ({ children }: { children: React.ReactElement }) =>
      React.cloneElement(children, { width: 600, height: 280 } as never),
  };
});

// hooks バレルは react-dnd (ESM) を巻き込むため、使う分だけ差し替える。
// 表示設定は store に置いてある。購読と dispatch だけを持つ最小の store で代える。
const listeners = new Set<() => void>();
let appState: { damageDensityIncludeNoPenetration?: boolean } = {};

const dispatch = mock((action: { type: string; payload: boolean }) => {
  if (action.type === "app/setDamageDensityIncludeNoPenetration") {
    appState = {
      ...appState,
      damageDensityIncludeNoPenetration: action.payload,
    };
    listeners.forEach((notify) => notify());
  }
});

const originalHooks = await import("../../../hooks");
await mock.module("../../../hooks", () => ({
  ...originalHooks,
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

await mock.module("next-i18next/pages", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: "ja" },
  }),
}));

const { default: DamageDensitySection } = await import("./DamageDensitySection");

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
      <DamageDensitySection report={report} targetMaxHp={99} targetCurrentHp={99} />
    </ThemeProvider>,
  );
}

it("整数目盛でも半ビンの表示範囲を丸めず、棒とホバー位置を維持する", () => {
  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection
        report={
          {
            data: {
              a: {
                proc_rate: 1,
                damage: { damage_density: { 0: 0.5, 5: 0.5 } },
              },
            },
          } as never
        }
        targetMaxHp={99}
        targetCurrentHp={99}
      />
    </ThemeProvider>,
  );

  const tickPositions = Array.from(
    container.querySelectorAll(".recharts-xAxis .recharts-cartesian-axis-tick-line"),
    (tick) => Number(tick.getAttribute("x1")),
  );
  // 本番と同じ [-0.5, 5.5] の範囲。600px の図では 0 と 5 の目盛が 86px / 506px。
  // Recharts 3 が上限を 6 に丸めると、表示位置とツールチップの切り替え境界がずれる。
  expect(tickPositions).toHaveLength(2);
  expect(tickPositions[0]).toBeCloseTo(86);
  expect(tickPositions[1]).toBeCloseTo(506);
});

it("中央値と上位5%は数値ではなく破線だけで示す", () => {
  const { container } = renderSection();

  // 図の中に置くと互いに重なるので、値はツールチップに任せる。
  expect(container.textContent).not.toContain("DamageDistribution.Median");
  expect(container.textContent).not.toContain("DamageDistribution.Upper5");

  const dashed = Array.from(container.querySelectorAll(".recharts-reference-line line")).filter(
    (el) => el.getAttribute("stroke-dasharray"),
  );

  expect(dashed).toHaveLength(2);
});

it("損傷状態以上になる確率を損傷状態の色つきで並べる", () => {
  const { container } = renderSection();

  // 撃沈行がそのまま撃破率にあたる。
  expect(container.textContent).toContain("DamageState.Sunk");

  const dots = Array.from(container.querySelectorAll("span[style*='background']")).filter(
    (el) => (el as HTMLElement).style.background,
  );

  const colors = [
    muiColors.yellow[500],
    muiColors.orange[500],
    muiColors.red[500],
    muiColors.blue[500],
  ];
  expect(dots).toHaveLength(colors.length);
  dots.forEach((dot, index) => {
    expect(dot).toHaveStyle({ background: colors[index] });
  });
});

function fillsOf(container: HTMLElement, selector: string) {
  return Array.from(container.querySelectorAll(selector))
    .map((el) => el.getAttribute("fill"))
    .filter((fill): fill is string => Boolean(fill));
}

it("残耐久に応じて損傷状態の帯と目盛が動く", () => {
  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection report={report} targetMaxHp={99} targetCurrentHp={40} />
    </ThemeProvider>,
  );

  const ticks = Array.from(
    container.querySelectorAll(".recharts-xAxis-tick-labels .recharts-cartesian-axis-tick-value"),
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

  const zones = Array.from(container.querySelectorAll(".recharts-reference-area"));

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
    container.querySelectorAll(".recharts-xAxis-tick-labels .recharts-cartesian-axis-tick-value"),
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
      <DamageDensitySection report={wide} targetMaxHp={400} targetCurrentHp={400} />
    </ThemeProvider>,
  );

  expect(container.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(0);
  expect(container.querySelectorAll(".recharts-area-area")).toHaveLength(1);

  // 階段は各点から次の点まで水平に引くので、末尾のビンにも右端の点が要る。
  // 無いと末尾のビンは幅 0 の縦線になり、面が図の右端まで届かない。
  const xs = (el: Element | null) =>
    Array.from((el?.getAttribute("d") ?? "").matchAll(/([\d.]+),[\d.]+/g)).map((m) => Number(m[1]));
  // 損傷状態の帯は図の右端まで敷く。
  const plotRight = Math.max(
    ...Array.from(container.querySelectorAll(".recharts-reference-area path"))
      .map(rectOf)
      .map((r) => r.x + r.width),
  );
  const areaRight = Math.max(...xs(container.querySelector(".recharts-area-area")));

  // SVG のシリアライザが面と矩形で丸める桁を変えるので、描画に影響しない
  // 0.001px 未満の差は許容する。
  expect(areaRight).toBeCloseTo(plotRight, 3);
});

function rectOf(el: Element) {
  const m = /M ([\d.]+),([\d.]+) h ([\d.]+) v ([\d.]+)/.exec(el.getAttribute("d") ?? "");

  return {
    x: Number(m?.[1]),
    y: Number(m?.[2]),
    width: Number(m?.[3]),
    height: Number(m?.[4]),
    fill: el.getAttribute("fill"),
  };
}

/** ダメージ0 の棒を作る段を、上から順に。 */
function firstBarStack(container: HTMLElement) {
  const rects = Array.from(container.querySelectorAll(".recharts-bar-rectangle path")).map(rectOf);

  const left = Math.min(...rects.map((r) => r.x));

  return rects.filter((r) => r.x === left).sort((a, b) => a.y - b.y);
}

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
      <DamageDensitySection report={spiky} targetMaxHp={99} targetCurrentHp={99} />
    </ThemeProvider>,
  );

  const ticks = Array.from(
    container.querySelectorAll(".recharts-yAxis-tick-labels .recharts-cartesian-axis-tick-value"),
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

  const waves = container.querySelectorAll(".recharts-reference-area g path");
  expect(waves.length).toBe(2);

  // ダメージ0 の棒。下から本体・切れ目（透明）・頭の3段。
  const stack = firstBarStack(container);

  expect(stack).toHaveLength(3);

  const [head, gap, bodyBar] = stack;

  // 頭は分布と同じ積み上げに載せるので、位置も幅も本体とそのまま揃う。
  expect(head.x).toBe(bodyBar.x);
  expect(head.width).toBe(bodyBar.width);

  expect(gap.fill).toBe("none");
  expect(head.y + head.height).toBeCloseTo(gap.y, 5);
  expect(gap.y + gap.height).toBeCloseTo(bodyBar.y, 5);
  expect(gap.height).toBeGreaterThan(0);
});

it("省略軸で積んでいるとき、凡例で消した種類は上段からも消え、残りの高さで継ぐ", () => {
  // 発動率の小さい Z が下の段。ダメージ0 の棒は Z 5% + Y 85.5% で、上段の窓は 80%〜100%。
  const typed = {
    data: {
      Z: {
        proc_rate: 0.05,
        style: { tag: "NightAttackStyle", attack_type: "Z" },
        damage: { damage_density: { 0: 1 } },
      },
      Y: {
        proc_rate: 0.95,
        style: { tag: "NightAttackStyle", attack_type: "Y" },
        damage: { damage_density: { 0: 0.9, 60: 0.1 } },
      },
    },
  } as never;

  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection report={typed} targetMaxHp={99} targetCurrentHp={99} />
    </ThemeProvider>,
  );

  const [head, , body] = firstBarStack(container);
  const bodyTop = body.y;
  const mark = () => container.querySelector(".recharts-reference-dot text")?.textContent;

  expect(mark()).toBe("90.5%");

  // Z を消しても Y だけで 85.5% あり、上段の窓に届く。本体は下段の天井まで
  // 伸びたままで、頭は 90.5% から 85.5% に下がる。
  fireEvent.click(screen.getByText("NightAttackType.Z"));

  const withoutZ = firstBarStack(container);
  expect(withoutZ).toHaveLength(3);
  expect(withoutZ[2].y).toBeCloseTo(bodyTop, 5);
  expect(withoutZ[0].y).toBeGreaterThan(head.y + 1);
  expect(mark()).toBe("85.5%");

  // Y を消すと Z の 5% だけになり、下段に収まる。Y の頭も切れ目も残さない。
  fireEvent.click(screen.getByText("NightAttackType.Z"));
  fireEvent.click(screen.getByText("NightAttackType.Y"));

  const withoutY = firstBarStack(container);
  expect(withoutY.map((r) => r.fill)).not.toContain(head.fill);
  expect(withoutY.map((r) => r.fill)).not.toContain("none");
  expect(mark()).toBeUndefined();
});

it("消して残った合計が上段の窓に届かなければ、二段軸をやめて実値を軸の上端に置く", () => {
  // ダメージ0 の棒は Z 30% + Y 56%。上段の窓は 80%〜100%。
  const typed = {
    data: {
      Z: {
        proc_rate: 0.3,
        style: { tag: "NightAttackStyle", attack_type: "Z" },
        damage: { damage_density: { 0: 1 } },
      },
      Y: {
        proc_rate: 0.7,
        style: { tag: "NightAttackStyle", attack_type: "Y" },
        damage: { damage_density: { 0: 0.8, 60: 0.2 } },
      },
    },
  } as never;

  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection report={typed} targetMaxHp={99} targetCurrentHp={99} />
    </ThemeProvider>,
  );

  const tickTexts = () =>
    Array.from(
      container.querySelectorAll(".recharts-yAxis-tick-labels .recharts-cartesian-axis-tick-value"),
    );
  const waves = () => container.querySelectorAll(".recharts-reference-area g path").length;
  const mark = () => container.querySelector(".recharts-reference-dot text");
  const yOf = (el: Element | null | undefined) => Number(el?.getAttribute("y"));

  expect(tickTexts().map((el) => el.textContent)).toContain("80%");
  expect(waves()).toBe(2);
  const axisTop = yOf(tickTexts().find((el) => el.textContent === "100%"));

  // Z の 30% だけが残る。下段の天井は超えるが、上段の窓には届かない。
  fireEvent.click(screen.getByText("NightAttackType.Y"));

  expect(waves()).toBe(0);
  expect(tickTexts().map((el) => el.textContent)).not.toContain("80%");
  expect(firstBarStack(container).map((r) => r.fill)).not.toContain("none");

  expect(mark()?.textContent).toBe("30.0%");
  expect(yOf(mark())).toBeCloseTo(axisTop, 5);
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
      <DamageDensitySection report={styled} targetMaxHp={99} targetCurrentHp={99} />
    </ThemeProvider>,
  );

  // 種類ぶんの系列になり、青の明度ランプで塗り分ける。
  // 2段なのでランプの両端を使う。
  const fills = fillsOf(container, ".recharts-bar-rectangle path");
  expect(new Set(fills)).toEqual(new Set([muiColors.lightBlue[800], muiColors.lightBlue[400]]));

  // 凡例に種類名と累計線が並ぶ。
  const legend = container.querySelector(".recharts-legend-wrapper");
  expect(legend?.textContent).toContain("NightAttackType.SingleAttack");
  expect(legend?.textContent).toContain("NightAttackType.DoubleAttack");
  expect(legend?.textContent).toContain("DamageDistribution.Cumulative");
});

it("種類が多いときは「その他」をランプから外して積む", () => {
  const attacks = ["SingleAttack", "DoubleAttack", "MainMain", "MainRadar", "MainAp"];

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
      <DamageDensitySection report={many} targetMaxHp={99} targetCurrentHp={99} />
    </ThemeProvider>,
  );

  // 軸の切れ目ぶんの透明な段は色ではないので除く。
  const fills = new Set(
    fillsOf(container, ".recharts-bar-rectangle path").filter((fill) => fill !== "none"),
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
        <DamageDensitySection report={typed(count)} targetMaxHp={99} targetCurrentHp={99} />
      </ThemeProvider>,
    );

    const found = new Set(
      fillsOf(container, ".recharts-bar-rectangle path").filter((fill) => fill !== "none"),
    );
    unmount();

    return found;
  };

  const dark = muiColors.lightBlue[800];
  const light = muiColors.lightBlue[400];

  // 段が2つなら端の2色だけ。使える幅は段の数によらないので、
  // 少ないからといって暗い側へ寄せたりしない。
  expect(fillsFor(2)).toEqual(new Set([dark, light]));

  expect(fillsFor(3)).toEqual(new Set([dark, "#1697da", light]));

  const four = fillsFor(4);
  expect(four.size).toBe(4);
  expect(four.has(dark)).toBe(true);
  expect(four.has(light)).toBe(true);
});

it("損傷状態の名前は図の外、罫は境界に重ねる", () => {
  const { container } = renderSection();

  // 損傷帯の矩形の上辺がプロット領域の上端＝境界。
  const zone = container.querySelector(".recharts-reference-area path");
  const plotTop = Number(/M\s*[\d.]+,([\d.]+)/.exec(zone?.getAttribute("d") ?? "")?.[1]);

  expect(plotTop).toBeGreaterThan(0);

  const zoneNames = Array.from(container.querySelectorAll(".recharts-reference-area text"));

  expect(zoneNames.length).toBeGreaterThan(0);

  // 名前は境界の上、つまり図の外。
  zoneNames.forEach((el) => {
    expect(Number(el.getAttribute("y"))).toBeLessThan(plotTop);
  });

  // 罫は境界そのものに重ねる。
  Array.from(container.querySelectorAll(".recharts-reference-area g line")).forEach((el) => {
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
      <DamageDensitySection report={single} targetMaxHp={99} targetCurrentHp={99} />
    </ThemeProvider>,
  );

  const rows = Array.from(container.querySelectorAll(".recharts-legend-wrapper span")).map(
    (el) => el.textContent,
  );

  // 棒と線が何を指すかは、系列が1つでも図からは分からない。
  expect(rows).toEqual(["NightAttackType.SingleAttack", "DamageDistribution.Cumulative"]);
});

it("比較しているときは貫通なしを塗り分けず、段としては残す", () => {
  const withNoPenetration = (noPenetration: number) =>
    ({
      proc_rate: 1,

      damage: {
        damage_density: { 0: 0.4, 8: noPenetration, 60: 0.6 - noPenetration },
        damage_density_no_penetration: { 8: noPenetration },
      },
    }) as never;

  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection
        report={{ data: { a: withNoPenetration(0.2) } } as never}
        targetMaxHp={99}
        targetCurrentHp={99}
        attackerShipName="ship1"
        compareReport={{ data: { a: withNoPenetration(0.1) } } as never}
        compareShipName="ship2"
      />
    </ThemeProvider>,
  );

  const rows = Array.from(container.querySelectorAll(".recharts-legend-wrapper span")).map(
    (el) => el.textContent,
  );

  // 塗り分けていないので、凡例に出しても示す色がない。艦名だけを並べる。
  expect(rows).toEqual(["ship1", "ship2"]);

  const fills = () => new Set(fillsOf(container, ".recharts-bar-rectangle path"));

  // 棒が2本並んでいるところをさらに塗り分けると、どちらの艦の段か読めなくなる。
  // 艦の色のまま積むので、図に出る色は艦の数だけ。
  expect(fills()).toEqual(new Set([muiColors.lightBlue[700], muiColors.pink[400]]));

  const bars = () => fillsOf(container, ".recharts-bar-rectangle path").length;
  const before = bars();

  // 色は同じでも段としては別なので、チェックボックスで外せる。
  fireEvent.click(screen.getByLabelText("DamageDistribution.NoPenetration"));

  expect(bars()).toBeLessThan(before);
  expect(fills()).toEqual(new Set([muiColors.lightBlue[700], muiColors.pink[400]]));
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
      <DamageDensitySection report={styled} targetMaxHp={99} targetCurrentHp={99} />
    </ThemeProvider>,
  );

  const fills = () => new Set(fillsOf(container, ".recharts-bar-rectangle path"));

  expect(fills()).toEqual(new Set([muiColors.lightBlue[800], muiColors.lightBlue[400]]));

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
  expect(fills()).toEqual(new Set([muiColors.lightBlue[700], muiColors.pink[400]]));
});

it("比較の有無で操作が入れ替わらない", () => {
  const compareReport = {
    data: {
      a: { proc_rate: 1, damage: { damage_density: { 0: 0.5, 40: 0.5 } } },
    },
  } as never;

  const { rerender } = render(
    <ThemeProvider>
      <DamageDensitySection report={report} targetMaxHp={99} targetCurrentHp={99} />
    </ThemeProvider>,
  );

  // 操作は「比較」と「装甲貫通なし」だけ。比較を選んでも出入りしないので、
  // 切り替えるたびに図が上下に動くことがない。
  const noPenetrationCheckbox = () => screen.getByLabelText("DamageDistribution.NoPenetration");

  expect(noPenetrationCheckbox()).toHaveProperty("checked", true);

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

  expect(noPenetrationCheckbox()).toHaveProperty("checked", true);
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
      <DamageDensitySection report={report} targetMaxHp={99} targetCurrentHp={99} />
    </ThemeProvider>,
  );

  const legend = () => container.querySelector(".recharts-legend-wrapper > div") as HTMLElement;
  const plotHeight = () =>
    container.querySelector(".recharts-cartesian-grid line")?.getAttribute("y1");

  // 凡例の nowrap / 22px は Tailwind CSS を読み込むブラウザーテストで検証する。

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
  expect(plotHeight()).toBe(before.plot);
});

it("凡例を押すとその系列を消せる", () => {
  const { container } = renderSection();

  const bars = () => container.querySelectorAll(".recharts-bar-rectangle path").length;
  const lines = () => container.querySelectorAll(".recharts-line-curve").length;

  expect(bars()).toBeGreaterThan(0);
  expect(lines()).toBe(1);

  fireEvent.click(screen.getByText("DamageDistribution.Cumulative"));
  expect(lines()).toBe(0);
  expect(bars()).toBeGreaterThan(0);

  fireEvent.click(screen.getByText("NightAttackType.SingleAttack"));
  fireEvent.click(screen.getByText("NightAttackType.DoubleAttack"));
  expect(bars()).toBe(0);

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
  const rows = Array.from(legend?.querySelectorAll("span") ?? []).map((el) => el.textContent);

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

  const lines = Array.from(container.querySelectorAll(".recharts-line-curve")).map((el) => ({
    stroke: el.getAttribute("stroke"),
    dash: el.getAttribute("stroke-dasharray"),
  }));

  // 色相はどちらの艦か、明るさは棒か線かを表す。
  // 補色を当てると相手の棒のほうが近くなり、襷掛けに見えてしまう。
  expect(lines.map((line) => line.stroke)).toEqual([muiColors.lightBlue[200], muiColors.pink[200]]);

  // 色で分かれるので、破線にはしない。
  expect(lines.map((line) => line.dash)).toEqual([null, null]);

  const strokes = Array.from(container.querySelectorAll(".recharts-legend-wrapper line")).map(
    (el) => el.getAttribute("stroke"),
  );

  expect(strokes).toEqual([muiColors.lightBlue[200], muiColors.pink[200]]);
});

it("比較していないときの累計線は棒の補色にする", () => {
  const { container } = renderSection();

  // 線が1本なら、どちらの艦かを示す必要がない。棒の系統から離して
  // 「確率の量ではなく右軸の補助線」だと分かるようにする。
  const strokes = Array.from(container.querySelectorAll(".recharts-line-curve")).map((el) =>
    el.getAttribute("stroke"),
  );

  expect(strokes).toEqual([muiColors.orange[300]]);
});

it("貫通なしを外すと、その質量だけ棒が低くなる", () => {
  const report = {
    data: {
      a: {
        proc_rate: 1,
        style: { tag: "NightAttackStyle", attack_type: "SingleAttack" },
        damage: {
          // ダメージ8 の 0.2 のうち 0.15 は1発も貫通しなかったぶん。
          damage_density: { 0: 0.4, 8: 0.2, 60: 0.4 },
          damage_density_no_penetration: { 8: 0.15 },
        },
      },
    },
  } as never;

  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection report={report} targetMaxHp={99} targetCurrentHp={99} />
    </ThemeProvider>,
  );

  const heightAt = (x: number) => {
    const rects = Array.from(container.querySelectorAll(".recharts-bar-rectangle path")).map(
      (el) => {
        const m = /M ([\d.]+),[\d.]+ h [\d.]+ v ([\d.]+)/.exec(el.getAttribute("d") ?? "");
        return { x: Number(m?.[1]), height: Number(m?.[2]) };
      },
    );

    return rects.sort((a, b) => a.x - b.x)[x]?.height ?? 0;
  };

  const noPenetrationCheckbox = () => screen.getByLabelText("DamageDistribution.NoPenetration");

  // 既定は算入。ダメージ8 の棒は 0.2 ぶん。
  expect(noPenetrationCheckbox()).toHaveProperty("checked", true);
  const before = { zero: heightAt(0), eight: heightAt(1) };

  fireEvent.click(noPenetrationCheckbox());

  // 貫通しなかったぶんが落ちて 0.05 になる。他のビンは動かない。
  expect(heightAt(1) / before.eight).toBeCloseTo(0.05 / 0.2, 5);
  expect(heightAt(0)).toBeCloseTo(before.zero, 5);
});

it("貫通なしを外すと図全体がその分布に切り替わる", () => {
  const report = {
    data: {
      a: {
        proc_rate: 1,
        style: { tag: "NightAttackStyle", attack_type: "SingleAttack" },
        damage: {
          // ダメージ8 の 0.3 はすべて1発も貫通しなかったぶん。
          damage_density: { 0: 0.3, 8: 0.3, 60: 0.4 },
          damage_density_no_penetration: { 8: 0.3 },
        },
      },
    },
  } as never;

  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection report={report} targetMaxHp={99} targetCurrentHp={99} />
    </ThemeProvider>,
  );

  // 中央値の破線。棒だけでなく代表値も同じ分布から作る。
  const medianX = () =>
    container.querySelector(".recharts-reference-line line")?.getAttribute("x1");

  // 累計線の右端。算入しないと総和が 1 未満になるので 100% に届かない。
  const cumulativeEnd = () => {
    const d = container.querySelector(".recharts-line-curve")?.getAttribute("d") ?? "";
    return Number(/([\d.]+)$/.exec(d)?.[1]);
  };

  const before = { median: medianX(), end: cumulativeEnd() };

  fireEvent.click(screen.getByLabelText("DamageDistribution.NoPenetration"));

  // 貫通しなかったぶんが中央値を作っていたので、外すと右へ動く。
  expect(medianX()).not.toBe(before.median);
  // 累計線の終点は下がる（＝軸の下のほうへ動くので y は大きくなる）。
  expect(cumulativeEnd()).toBeGreaterThan(before.end);
});

it("1発も貫通しない艦は、貫通なしを外すと 0% の分布として描く", () => {
  const neverPenetrates = {
    data: {
      a: {
        proc_rate: 1,
        style: { tag: "NightAttackStyle", attack_type: "SingleAttack" },
        damage: {
          damage_density: { 0: 0.4, 5: 0.6 },
          damage_density_no_penetration: { 0: 0.4, 5: 0.6 },
        },
      },
    },
  } as never;

  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection report={neverPenetrates} targetMaxHp={99} targetCurrentHp={99} />
    </ThemeProvider>,
  );

  fireEvent.click(screen.getByLabelText("DamageDistribution.NoPenetration"));

  // データが無いのではなく、貫通する確率が 0。
  expect(screen.queryByText("Unknown")).toBeNull();
  expect(container.querySelector(".recharts-line-curve")).not.toBeNull();
  // 代表値は無いので破線は引かない。
  expect(container.querySelector(".recharts-reference-line")).toBeNull();
});

it("比較艦が1発も貫通しなくても、貫通なしを外したまま比較を続ける", () => {
  const compareReport = {
    data: {
      a: {
        proc_rate: 1,
        damage: {
          damage_density: { 0: 0.4, 5: 0.6 },
          damage_density_no_penetration: { 0: 0.4, 5: 0.6 },
        },
      },
    },
  } as never;

  const report = {
    data: {
      a: {
        proc_rate: 1,
        damage: {
          damage_density: { 0: 0.3, 40: 0.7 },
          damage_density_no_penetration: { 0: 0.3 },
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
        compareReport={compareReport}
        compareShipName="B"
      />
    </ThemeProvider>,
  );

  fireEvent.click(screen.getByLabelText("DamageDistribution.NoPenetration"));

  const legend = container.querySelector(".recharts-legend-wrapper");
  expect(legend?.textContent).toContain("B");
});

it("貫通なしの算入を切り替えても軸は動かない", () => {
  const report = {
    data: {
      a: {
        proc_rate: 1,
        style: { tag: "NightAttackStyle", attack_type: "SingleAttack" },
        damage: {
          // 山の頂点（ダメージ8 の 0.5）のほとんどが貫通しなかったぶん。
          // 軸を描く分布から決めていると、外したとたんに縦軸が縮む。
          damage_density: { 0: 0.1, 8: 0.5, 60: 0.4 },
          damage_density_no_penetration: { 8: 0.45 },
        },
      },
    },
  } as never;

  const { container } = render(
    <ThemeProvider>
      <DamageDensitySection report={report} targetMaxHp={99} targetCurrentHp={99} />
    </ThemeProvider>,
  );

  const ticksOf = (selector: string) =>
    Array.from(
      container.querySelectorAll(`${selector}-tick-labels .recharts-cartesian-axis-tick-value`),
    ).map((el) => el.textContent);

  const before = {
    rate: ticksOf(".recharts-yAxis"),
    damage: ticksOf(".recharts-xAxis"),
  };

  expect(before.rate.length).toBeGreaterThan(1);

  fireEvent.click(screen.getByLabelText("DamageDistribution.NoPenetration"));

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
      <DamageDensitySection report={typed([0.3, 0.7])} targetMaxHp={99} targetCurrentHp={99} />
    </ThemeProvider>,
  );

  const fillsNow = () =>
    new Set(fillsOf(container, ".recharts-bar-rectangle path").filter((fill) => fill !== "none"));

  fireEvent.click(screen.getByText("NightAttackType.T0"));
  expect(fillsNow().size).toBe(1);

  // 発動率が入れ替わると積む順も入れ替わる。添字で覚えていると、
  // 消したはずの T0 ではなく T1 が消えたままになる。
  rerender(
    <ThemeProvider>
      <DamageDensitySection report={typed([0.7, 0.3])} targetMaxHp={99} targetCurrentHp={99} />
    </ThemeProvider>,
  );

  const hiddenLabel = container.querySelector(
    '.recharts-legend-wrapper [role="button"][aria-pressed="false"]',
  )?.textContent;

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
  const rows = Array.from(legend?.querySelectorAll("span") ?? []).map((el) => el.textContent);

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
      <DamageDensitySection report={many} targetMaxHp={999} targetCurrentHp={999} />
    </ThemeProvider>,
  );

  expect(container.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(0);

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
  const marks = Array.from(container.querySelectorAll(".recharts-reference-dot text"));

  expect(marks.map((el) => el.textContent)).toEqual(["80.0%", "70.0%"]);
  expect(marks[0].getAttribute("fill")).not.toBe(marks[1].getAttribute("fill"));
  expect(Number(marks[0].getAttribute("y"))).toBeLessThan(Number(marks[1].getAttribute("y")));

  expect(container.querySelectorAll(".recharts-reference-area g path").length).toBe(0);
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
      <DamageDensitySection report={narrow} targetMaxHp={99} targetCurrentHp={40} />
    </ThemeProvider>,
  );

  const grid = container.querySelector(".recharts-cartesian-grid-horizontal line");
  const plotLeft = Number(grid?.getAttribute("x1"));
  const plotRight = Number(grid?.getAttribute("x2"));

  expect(plotLeft).toBeGreaterThan(0);

  const bars = Array.from(container.querySelectorAll(".recharts-bar-rectangle path")).map((el) => {
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

it("貫通なしを算入するかはタブをまたいでも保つ", () => {
  const noPenetrationCheckbox = () => screen.getByRole("checkbox", { name: /NoPenetration/ });

  const { unmount } = renderSection();
  expect(noPenetrationCheckbox()).toBeChecked();

  fireEvent.click(noPenetrationCheckbox());
  expect(dispatch).toHaveBeenCalledWith({
    type: "app/setDamageDensityIncludeNoPenetration",
    payload: false,
  });

  // タブを移ってアンマウントされても、開き直したときに残っていること。
  unmount();
  renderSection();
  expect(noPenetrationCheckbox()).not.toBeChecked();
});
