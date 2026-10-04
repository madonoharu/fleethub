import type { HistoricalBonusDef as PublishedHistoricalBonusDef, MasterShip } from "fleethub-core";

import { getMapKey, Kc3Bonus, Kc3BonusFile, Kc3BonusGroup, Kc3DebuffGroup } from "./kc3";

/** 公開済みの fleethub-core の型に aerial_only が載るまでの拡張 */
export type HistoricalBonusDef = PublishedHistoricalBonusDef & { aerial_only?: boolean };

const MAX_GEARS_PER_SHIP = 6;

/**
 * 艦船IDから、その艦の未改造時のID (改造ツリーの根) を引けるようにする。
 *
 * KC3 の `shipBase` は未改造時のIDで艦を指定するため、
 * fleethub の `ship_id_in` に変換するには同じ改造ツリーのIDを全て列挙する必要がある。
 */
class RemodelTree {
  private readonly baseIds = new Map<number, number[]>();

  constructor(ships: MasterShip[]) {
    const prevIds = new Map<number, number>();

    ships.forEach(({ ship_id, next_id }) => {
      if (next_id && !prevIds.has(next_id)) {
        prevIds.set(next_id, ship_id);
      }
    });

    ships.forEach(({ ship_id }) => {
      // 改造ツリーが循環していても止まるように、辿ったIDを覚えておく
      const chain = new Set<number>([ship_id]);
      let baseId = ship_id;

      for (;;) {
        const prevId = prevIds.get(baseId);
        if (prevId === undefined || chain.has(prevId)) break;
        chain.add(prevId);
        baseId = prevId;
      }

      const group = this.baseIds.get(baseId);
      if (group) {
        group.push(ship_id);
      } else {
        this.baseIds.set(baseId, [ship_id]);
      }
    });
  }

  expand(baseIds: number[]): number[] {
    return baseIds.flatMap((baseId) => this.baseIds.get(baseId) || [baseId]);
  }
}

function and(expressions: string[]): string {
  const terms = expressions.filter((expr) => expr.length > 0);

  if (terms.length <= 1) {
    return terms.join("");
  }

  return terms.map((expr) => (expr.includes("||") ? `(${expr})` : expr)).join(" && ");
}

function or(expressions: string[]): string {
  return expressions.join(" || ");
}

function not(expression: string): string {
  return expression.includes("||") ? `!(${expression})` : `!${expression}`;
}

function matchesAny(key: string, values: number[]): string {
  const [head] = values;

  if (values.length === 1 && head !== undefined) {
    return `${key} == ${head}`;
  }

  return `${key}_in(${values.join(", ")})`;
}

function callsAny(singular: string, plural: string, values: number[]): string {
  const [head] = values;

  if (values.length === 1 && head !== undefined) {
    return `${singular}(${head})`;
  }

  return `${plural}(${values.join(", ")})`;
}

function toNodeExpr(group: Pick<Kc3BonusGroup, "nodes" | "nodesExclude">): string {
  const expressions: string[] = [];

  if (group.nodes?.length) {
    expressions.push(or(group.nodes));
  }
  if (group.nodesExclude?.length) {
    expressions.push(not(or(group.nodesExclude)));
  }

  return and(expressions);
}

function toShipExpr(bonus: Kc3Bonus, remodelTree: RemodelTree, perEquipStep: number): string {
  const expressions: string[] = [];

  if (bonus.shipType?.length) {
    expressions.push(matchesAny("ship_type", bonus.shipType));
  }
  if (bonus.shipClass?.length) {
    expressions.push(matchesAny("ship_class", bonus.shipClass));
  }
  if (bonus.shipBase?.length) {
    expressions.push(
      matchesAny(
        "ship_id",
        remodelTree.expand(bonus.shipBase).sort((a, b) => a - b),
      ),
    );
  }
  if (bonus.shipId?.length) {
    expressions.push(matchesAny("ship_id", bonus.shipId));
  }

  // perEquip は、装備種の指定があれば装備種の個数で数える (KC3 と同じ)
  const perEquipKey = bonus.requireEquipType?.length ? "requireEquipType" : "requireEquipId";
  const idStep = perEquipKey === "requireEquipId" ? perEquipStep : 1;
  const typeStep = perEquipKey === "requireEquipType" ? perEquipStep : 1;
  const countsRemainingPlanes = Boolean(bonus.isPlane || bonus.requireSlot);

  if (bonus.requireEquipId?.length) {
    const ids = bonus.requireEquipId;
    const stars = bonus.requireEquipLevel || 0;
    const countExpr = ids
      .map((id) => (stars ? `count_by_stars(${id}, ${stars})` : `count(${id})`))
      .join(" + ");
    const minCount = bonus.requireEquipIdNum || 1;
    const remainingExpr = `count_remaining_planes(${ids.join(", ")})`;

    // requireEquipIdNumX を見るのは艦載機の補正だけ (KC3 と同じ)
    if (bonus.isPlane) {
      if (bonus.requireEquipIdNumX) {
        expressions.push(`${countExpr} == ${bonus.requireEquipIdNumX}`);
      }
      if (minCount > 1) {
        expressions.push(`${countExpr} >= ${minCount}`);
      }
      expressions.push(`${remainingExpr} >= ${idStep}`);
    } else {
      const num = Math.max(minCount, idStep);

      if (num > 1 || stars) {
        expressions.push(`${countExpr} >= ${num}`);
      }
      if (bonus.requireSlot) {
        expressions.push(`${remainingExpr} >= ${num}`);
      } else if (num === 1 && !stars) {
        expressions.push(callsAny("has", "has_any", ids));
      }
    }
  }

  if (bonus.requireEquipType?.length) {
    const types = bonus.requireEquipType;
    const minCount = bonus.isPlane ? 1 : bonus.requireEquipTypeNum || 1;
    const num = Math.max(minCount, typeStep);

    if (countsRemainingPlanes) {
      expressions.push(`count_remaining_planes_by_gear_type(${types.join(", ")}) >= ${num}`);
    } else if (num === 1) {
      expressions.push(callsAny("has_gear_type", "has_any_gear_type", types));
    } else {
      expressions.push(`${types.map((type) => `count_gear_type(${type})`).join(" + ")} >= ${num}`);
    }
  }

  return and(expressions);
}

function toBonusDefs(
  map: number,
  group: Kc3BonusGroup,
  bonus: Kc3Bonus,
  remodelTree: RemodelTree,
): HistoricalBonusDef[] {
  const dmg = bonus.dmg ?? 1;
  const acc = bonus.acc ?? 1;
  const eva = bonus.eva ?? 1;

  if (bonus.unconfirmed || (dmg === 1 && acc === 1 && eva === 1)) {
    return [];
  }

  const requiresEquips = Boolean(bonus.requireEquipId?.length || bonus.requireEquipType?.length);
  if (bonus.perEquip && !bonus.isPlane && !requiresEquips) {
    return [];
  }

  const node = toNodeExpr(group);
  // perEquip は「条件を満たす装備の数だけ補正を累乗する」ため、
  // 必要個数を 1, 2, ... と増やした定義に展開する。
  // fleethub は一致した定義の補正を全て乗算するので、これで累乗と等価になる。
  const steps = bonus.perEquip ? MAX_GEARS_PER_SHIP : 1;

  return Array.from({ length: steps }, (_, i) => {
    const def: HistoricalBonusDef = { map };
    const ship = toShipExpr(bonus, remodelTree, i + 1);

    if (node) def.node = node;
    if (ship) def.ship = ship;
    // https://docs.google.com/document/d/1TmsVRhmkqjH1bczdoBHtrdcYv7JYD95NVkMrAK5bpK4/edit
    // この説明 (2026 版) と違い、notAirOnly の補正は KC3 と同じく空母でない艦の砲撃・雷撃にも掛ける。
    if (bonus.isPlane && !bonus.notAirOnly) def.aerial_only = true;
    if (dmg !== 1) def.power_mod = { a: dmg };
    if (acc !== 1) def.accuracy_mod = acc;
    if (eva !== 1) def.evasion_mod = eva;

    return def;
  });
}

function toDebuffDefs(map: number, group: Kc3DebuffGroup): HistoricalBonusDef[] {
  const node = toNodeExpr(group);

  return group.debuffs.flatMap((debuff) => {
    if (!debuff.amount) {
      return [];
    }

    const def: HistoricalBonusDef = { map };
    if (node) def.node = node;
    def.debuff = true;
    if (debuff.shipId?.length) def.enemy = matchesAny("ship_id", debuff.shipId);
    def.armor_penetration = debuff.amount;

    return [def];
  });
}

function convertKc3BonusFile(file: Kc3BonusFile, remodelTree: RemodelTree): HistoricalBonusDef[] {
  const map = getMapKey(file);

  const bonuses = (file.listBonus || []).flatMap((group) =>
    group.bonuses.flatMap((bonus) => toBonusDefs(map, group, bonus, remodelTree)),
  );

  const debuffs = (file.listDebuff || []).flatMap((group) => toDebuffDefs(map, group));

  return [...bonuses, ...debuffs];
}

export function convertKc3BonusFiles(
  files: Kc3BonusFile[],
  ships: MasterShip[],
): HistoricalBonusDef[] {
  const remodelTree = new RemodelTree(ships);

  return files.flatMap((file) => convertKc3BonusFile(file, remodelTree));
}
