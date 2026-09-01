import type { AttackReport, DamageState } from "fleethub-core";

import {
  createDamageAxisTicks,
  createDamageChartRows,
  createDamageStateZones,
  createDamageDensityBreakdown,
  createRateAxisTicks,
  getClippedRateMax,
  getDamageState,
  getRequiredDamage,
  getTailRate,
  mergeDamageDensity,
  toDamageDensityStats,
  type DamageDensity,
  type DamageDensitySource,
} from "./damageDensity";

type Entry = Pick<AttackReport<unknown>, "proc_rate" | "damage">;

function entry(
  proc_rate: number | null,
  damage_density: DamageDensity | null,
): Entry {
  return {
    proc_rate,
    damage: damage_density
      ? ({ damage_density } as unknown as NonNullable<Entry["damage"]>)
      : null,
  };
}

function source(...entries: Entry[]): DamageDensitySource {
  return Object.fromEntries(entries.map((v, i) => [`k${i}`, v]));
}

/** 一様分布 0..n-1 */
function uniform(n: number): DamageDensity {
  const result: Record<number, number> = {};
  for (let i = 0; i < n; i++) result[i] = 1 / n;
  return result;
}

describe("mergeDamageDensity", () => {
  it("発動率で加重して合算する", () => {
    const merged = mergeDamageDensity(
      source(entry(0.3, { 0: 1 }), entry(0.7, { 0: 0.5, 10: 0.5 })),
    );

    expect(merged?.[0]).toBeCloseTo(0.3 + 0.35, 12);
    expect(merged?.[10]).toBeCloseTo(0.35, 12);
  });

  it("proc_rate が欠けていれば null", () => {
    expect(mergeDamageDensity(source(entry(null, { 0: 1 })))).toBeNull();
  });

  it("damage が欠けていれば null", () => {
    expect(mergeDamageDensity(source(entry(1, null)))).toBeNull();
  });

  it("空なら null", () => {
    expect(mergeDamageDensity({})).toBeNull();
  });

  it("penetration は割合ダメージだけの質量を取り除く", () => {
    const data = {
      a: {
        proc_rate: 1,
        damage: {
          damage_density: { 0: 0.4, 8: 0.2, 60: 0.4 },
          // ダメージ8 の 0.2 のうち 0.15 は全弾が割合ダメージだったぶん。
          damage_density_scratch_only: { 8: 0.15 },
        },
      },
    } as unknown as DamageDensitySource;

    const penetration = mergeDamageDensity(data, "penetration");

    // 引いた質量は 0 へ動かさず消える。
    expect(penetration?.[0]).toBeCloseTo(0.4, 12);
    expect(penetration?.[8]).toBeCloseTo(0.05, 12);
    expect(penetration?.[60]).toBeCloseTo(0.4, 12);

    // 引き切ったビンは残さない。丸めで極小の負値が出ても同じ。
    expect(
      mergeDamageDensity(
        {
          a: {
            proc_rate: 1,
            damage: {
              damage_density: { 8: 0.2 },
              damage_density_scratch_only: { 8: 0.2 },
            },
          },
        } as unknown as DamageDensitySource,
        "penetration",
      ),
    ).toEqual({});
  });
});

describe("toDamageDensityStats", () => {
  it("欠損したダメージ値を 0 で埋めて累計を計算する", () => {
    const stats = toDamageDensityStats({ 0: 0.25, 3: 0.75 });

    expect(stats?.points.map((p) => p.damage)).toEqual([0, 1, 2, 3]);
    expect(stats?.points.map((p) => p.rate)).toEqual([0.25, 0, 0, 0.75]);
    expect(stats?.points.map((p) => p.cumulative)).toEqual([
      0.25, 0.25, 0.25, 1,
    ]);
    expect(stats?.total).toBeCloseTo(1, 12);
  });

  it("キーの順序に依存しない", () => {
    const stats = toDamageDensityStats({ 10: 0.5, 2: 0.5 });
    expect(stats?.points.at(-1)?.damage).toBe(10);
    expect(stats?.points[2]?.rate).toBe(0.5);
  });

  it("空・null なら null", () => {
    expect(toDamageDensityStats(null)).toBeNull();
    expect(toDamageDensityStats({})).toBeNull();
  });

  it("中央値と上位5%", () => {
    const stats = toDamageDensityStats(uniform(10));
    expect(stats?.median).toBe(4);
    expect(stats?.upper5).toBe(9);
  });

  it("確率質量が 1 未満でも代表値は変わらない", () => {
    const half = Object.fromEntries(
      Object.entries(uniform(10)).map(([k, v]) => [k, (v ?? 0) * 0.5]),
    );
    const stats = toDamageDensityStats(half);

    expect(stats?.total).toBeCloseTo(0.5, 12);
    expect(stats?.median).toBe(4);
    expect(stats?.upper5).toBe(9);
  });
});

describe("getTailRate", () => {
  const stats = toDamageDensityStats(uniform(10))!;

  it("x <= 0 なら全確率", () => {
    expect(getTailRate(stats, 0)).toBeCloseTo(1, 12);
    expect(getTailRate(stats, -5)).toBeCloseTo(1, 12);
  });

  it("P(ダメージ >= x)", () => {
    expect(getTailRate(stats, 5)).toBeCloseTo(0.5, 12);
    expect(getTailRate(stats, 9)).toBeCloseTo(0.1, 12);
  });

  it("最大値を超えたら 0", () => {
    expect(getTailRate(stats, 10)).toBe(0);
    expect(getTailRate(stats, 999)).toBe(0);
  });
});

describe("getDamageState", () => {
  it("Rust の DamageState::new と同じ閾値", () => {
    const table: [number, number, DamageState][] = [
      [99, 0, "Sunk"],
      [99, 24, "Taiha"],
      [99, 25, "Chuuha"],
      [99, 49, "Chuuha"],
      [99, 50, "Shouha"],
      [99, 74, "Shouha"],
      [99, 75, "Normal"],
      [99, 99, "Normal"],
      [12, 3, "Taiha"],
      [12, 4, "Chuuha"],
      [12, 7, "Shouha"],
      [12, 10, "Normal"],
    ];

    table.forEach(([maxHp, currentHp, expected]) => {
      expect(getDamageState(maxHp, currentHp)).toBe(expected);
    });
  });
});

describe("getRequiredDamage", () => {
  it("その損傷以上にする最小ダメージ", () => {
    // max_hp 99, current_hp 99 -> Shouha bound 74, Chuuha bound 49, Taiha bound 24
    expect(getRequiredDamage("Shouha", 99, 99)).toBe(25);
    expect(getRequiredDamage("Chuuha", 99, 99)).toBe(50);
    expect(getRequiredDamage("Taiha", 99, 99)).toBe(75);
    expect(getRequiredDamage("Sunk", 99, 99)).toBe(99);
  });

  it("負にはならない", () => {
    expect(getRequiredDamage("Shouha", 99, 10)).toBe(0);
  });
});

describe("createDamageChartRows", () => {
  const main = toDamageDensityStats(uniform(8))!;

  it("ビン分割しないときは 1 ダメージ 1 行", () => {
    const rows = createDamageChartRows({ main, maxPoints: 512 });
    expect(rows).toHaveLength(8);
    expect(rows[3]).toMatchObject({ damage: 3, damageEnd: 3 });
    expect(rows[7]?.cumulative).toBeCloseTo(1, 12);
  });

  it("点数が多いときはビンにまとめる", () => {
    const rows = createDamageChartRows({ main, maxPoints: 4 });

    expect(rows).toHaveLength(4);
    expect(rows[0]).toMatchObject({ damage: 0, damageEnd: 1 });
    expect(rows[0]?.rate).toBeCloseTo(0.25, 12);
    expect(rows[0]?.cumulative).toBeCloseTo(0.25, 12);
    expect(rows[3]?.cumulative).toBeCloseTo(1, 12);
  });

  it("損傷状態でラベル付けする", () => {
    const rows = createDamageChartRows({ main, maxHp: 8, currentHp: 8 });

    // bound: Shouha 6, Chuuha 4, Taiha 2
    expect(rows[0]?.state).toBe("Normal"); // 残 8
    expect(rows[2]?.state).toBe("Shouha"); // 残 6
    expect(rows[4]?.state).toBe("Chuuha"); // 残 4
    expect(rows[6]?.state).toBe("Taiha"); // 残 2
  });

  it("耐久が不明なら state は null", () => {
    const rows = createDamageChartRows({ main });
    expect(rows.every((row) => row.state === null)).toBe(true);
  });

  it("比較系列を重ねられる", () => {
    const compare = toDamageDensityStats({ 0: 0.5, 20: 0.5 })!;
    const rows = createDamageChartRows({ main, compare });

    expect(rows).toHaveLength(21);
    // 主系列は 8 以降存在しないので rate 0、累計は最終値で頭打ち
    expect(rows[20]?.rate).toBe(0);
    expect(rows[20]?.cumulative).toBeCloseTo(1, 12);
    expect(rows[20]?.compareRate).toBeCloseTo(0.5, 12);
    expect(rows[20]?.compareCumulative).toBeCloseTo(1, 12);
  });
});

describe("損傷状態ごとの合計が damage_state_density と一致する", () => {
  it("ダメージ分布を損傷状態で束ねると Rust と同じ割合になる", () => {
    const maxHp = 20;
    const currentHp = 20;
    const density: DamageDensity = {
      0: 0.4,
      6: 0.2,
      11: 0.2,
      16: 0.1,
      20: 0.1,
    };
    const stats = toDamageDensityStats(density)!;

    const grouped: Partial<Record<DamageState, number>> = {};
    stats.points.forEach(({ damage, rate }) => {
      if (!rate) return;
      const state = getDamageState(maxHp, currentHp - damage);
      grouped[state] = (grouped[state] ?? 0) + rate;
    });

    // bound: Shouha 15, Chuuha 10, Taiha 5
    expect(grouped).toEqual({
      Normal: 0.4, // 残 20
      Shouha: 0.2, // 残 14
      Chuuha: 0.2, // 残 9
      Taiha: 0.1, // 残 4
      Sunk: 0.1, // 残 0
    });
  });
});

describe("createDamageStateZones", () => {
  it("損傷状態の境界でダメージ軸を区切る", () => {
    expect(createDamageStateZones(99, 99, 130)).toEqual([
      { state: "Normal", from: 0, to: 25 },
      { state: "Shouha", from: 25, to: 50 },
      { state: "Chuuha", from: 50, to: 75 },
      { state: "Taiha", from: 75, to: 99 },
      // 撃沈帯は右端まで伸ばす。オーバーキル分もここに入る。
      { state: "Sunk", from: 99, to: 131 },
    ]);
  });

  it("分布が届かない帯は落とす", () => {
    const zones = createDamageStateZones(99, 99, 60);

    expect(zones.map((zone) => zone.state)).toEqual([
      "Normal",
      "Shouha",
      "Chuuha",
    ]);
    // 最後の帯は軸の右端で止める。
    expect(zones.at(-1)).toEqual({ state: "Chuuha", from: 50, to: 61 });
  });

  it("残耐久が小さく境界が重なるときは幅0の帯を作らない", () => {
    // 耐久4・残耐久1 → bound は Shouha 3 / Chuuha 2 / Taiha 1、必要ダメージはすべて 0。
    expect(createDamageStateZones(4, 1, 3)).toEqual([
      { state: "Taiha", from: 0, to: 1 },
      { state: "Sunk", from: 1, to: 4 },
    ]);
  });
});

describe("createDamageAxisTicks", () => {
  it("等間隔ではなく境界値そのものを目盛にする", () => {
    const zones = createDamageStateZones(99, 99, 130);

    expect(createDamageAxisTicks(zones, 130)).toEqual([0, 25, 50, 75, 99, 130]);
  });

  it("右端が境界値と近すぎるときは境界値を優先する", () => {
    const zones = createDamageStateZones(99, 99, 101);

    // 99 と 101 は重なって読めないので 101 は置かない。
    expect(createDamageAxisTicks(zones, 101)).toEqual([0, 25, 50, 75, 99]);
  });
});

describe("getClippedRateMax", () => {
  it("先頭のビンを除いた最大値に合わせる", () => {
    const stats = toDamageDensityStats({ 0: 0.6, 3: 0.1, 5: 0.3 })!;
    const rows = createDamageChartRows({ main: stats });

    expect(getClippedRateMax(rows)).toBeCloseTo(0.3);
  });

  it("先頭以外に山がないときは頭打ちにしない", () => {
    const stats = toDamageDensityStats({ 0: 1 })!;
    const rows = createDamageChartRows({ main: stats });

    expect(getClippedRateMax(rows)).toBe(1);
  });

  it("比較系列のほうが高ければそちらに合わせる", () => {
    const main = toDamageDensityStats({ 0: 0.6, 5: 0.4 })!;
    const compare = toDamageDensityStats({ 0: 0.3, 5: 0.7 })!;
    const rows = createDamageChartRows({ main, compare });

    expect(getClippedRateMax(rows)).toBeCloseTo(0.7);
  });
});

describe("createRateAxisTicks", () => {
  it("きりのいい刻みで置き、上限そのものには打たない", () => {
    expect(
      createRateAxisTicks(0.0151).map((v) => +(v * 100).toFixed(2)),
    ).toEqual([0, 0.5, 1, 1.5]);
    expect(createRateAxisTicks(0.3).map((v) => +(v * 100).toFixed(2))).toEqual([
      0, 10, 20, 30,
    ]);
  });

  it("区間数が4に近くなる刻みを選ぶ", () => {
    // 0.2% 刻みだと7区間、0.5% 刻みだと2区間。0.25% 刻みの5区間がいちばん近い。
    expect(
      createRateAxisTicks(0.0145).map((v) => +(v * 100).toFixed(2)),
    ).toEqual([0, 0.25, 0.5, 0.75, 1, 1.25]);
  });

  it("上限が0以下なら目盛は0だけ", () => {
    expect(createRateAxisTicks(0)).toEqual([0]);
  });
});

describe("createDamageDensityBreakdown", () => {
  const data = {
    a: { proc_rate: 0.5, damage: { damage_density: { 0: 0.5, 10: 0.5 } } },
    b: { proc_rate: 0.3, damage: { damage_density: { 40: 1 } } },
    c: { proc_rate: 0.2, damage: { damage_density: { 80: 1 } } },
  } as unknown as DamageDensitySource;

  it("発動率で加重し、総和が合計と一致する", () => {
    const items = createDamageDensityBreakdown(data)!;
    const total = toDamageDensityStats(mergeDamageDensity(data))!;

    expect(items.map((item) => item.stats.total)).toEqual([0.2, 0.3, 0.5]);

    const summed = items.reduce((acc, item) => acc + item.stats.total, 0);
    expect(summed).toBeCloseTo(total.total);

    // ダメージ値ごとに足しても合計の形と一致する。
    total.points.forEach((point) => {
      const stacked = items.reduce(
        (acc, item) => acc + (item.stats.points[point.damage]?.rate ?? 0),
        0,
      );
      expect(stacked).toBeCloseTo(point.rate);
    });
  });

  it("発動率の小さいものほど先（＝図の下）に積む", () => {
    const items = createDamageDensityBreakdown(data)!;

    expect(items.map((item) => item.procRate)).toEqual([0.2, 0.3, 0.5]);

    // 強さの順とは違う。発動率の大きい a が中央値0 でも一番上に来る。
    const uneven = {
      a: { proc_rate: 0.7, damage: { damage_density: { 0: 1 } } },
      b: { proc_rate: 0.3, damage: { damage_density: { 80: 1 } } },
    } as unknown as DamageDensitySource;

    expect(
      createDamageDensityBreakdown(uneven)!.map((item) => item.stats.median),
    ).toEqual([80, 0]);
  });

  it("系列が多いときは発動率の小さいものをその他にまとめる", () => {
    const items = createDamageDensityBreakdown(data, 2)!;

    // 上位2種類 ＋ その他。
    expect(items).toHaveLength(3);
    // 発動率0.2 の c だけが「その他」になる。
    const other = items.find((item) => item.key === null)!;
    expect(other.procRate).toBeCloseTo(0.2);
    expect(other.stats.median).toBe(80);
  });

  it("発動率かダメージが欠けていれば null", () => {
    expect(
      createDamageDensityBreakdown({
        a: { proc_rate: null, damage: { damage_density: { 0: 1 } } },
      } as never),
    ).toBeNull();
  });
});
