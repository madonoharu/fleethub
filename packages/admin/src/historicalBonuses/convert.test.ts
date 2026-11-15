import { describe, expect, it } from "bun:test";

import { convertKc3BonusFiles } from "./convert";
import { Kc3Bonus } from "./kc3";

describe("KC3 shipBase expansion", () => {
  it("covers every form of a ship whose remodels form a cycle", () => {
    const ships = [
      { ship_id: 645, next_id: 650 },
      { ship_id: 650, next_id: 699 },
      { ship_id: 699, next_id: 645 },
    ] as Parameters<typeof convertKc3BonusFiles>[1];

    const [def] = convertKc3BonusFiles(
      [{ world: 61, mapnum: 4, listBonus: [{ bonuses: [{ dmg: 1.22, shipBase: [699] }] }] }],
      ships,
    );

    for (const id of [645, 650, 699]) {
      expect(def.ship).toContain(String(id));
    }
  });

  it("covers every form of a ship reached from two predecessors", () => {
    const ships = [
      { ship_id: 596, next_id: 692 },
      { ship_id: 628, next_id: 629 },
      { ship_id: 629, next_id: 628 },
      { ship_id: 692, next_id: 628 },
    ] as Parameters<typeof convertKc3BonusFiles>[1];

    const [def] = convertKc3BonusFiles(
      [{ world: 61, mapnum: 1, listBonus: [{ bonuses: [{ dmg: 1.1, shipBase: [596] }] }] }],
      ships,
    );

    expect(def.ship).toBe("ship_id_in(596, 628, 629, 692)");
  });
});

describe("KC3 plane bonuses", () => {
  const convert = (bonus: Kc3Bonus) =>
    convertKc3BonusFiles([{ world: 60, mapnum: 1, listBonus: [{ bonuses: [bonus] }] }], []);

  it("requires a remaining plane and limits air-only bonuses to aerial attacks", () => {
    const [def] = convert({ dmg: 1.18, requireEquipId: [554], requireEquipIdNumX: 1, isPlane: 1 });

    expect(def.ship).toBe("count(554) == 1 && count_remaining_planes(554) >= 1");
    expect(def.aerial_only).toBe(true);
  });

  it("applies bonuses marked notAirOnly to every attack", () => {
    const [def] = convert({ dmg: 1.04, requireEquipId: [237, 322], isPlane: 1, notAirOnly: 1 });

    expect(def.ship).toBe("count_remaining_planes(237, 322) >= 1");
    expect(def.aerial_only).toBeUndefined();
  });
});

describe("KC3 equipment conditions", () => {
  const convert = (bonus: Kc3Bonus) =>
    convertKc3BonusFiles([{ world: 60, mapnum: 1, listBonus: [{ bonuses: [bonus] }] }], []);

  it("drops a perEquip bonus that names no equipment, as KC3 counts none", () => {
    expect(convert({ dmg: 1.1, shipType: [2], perEquip: 1 })).toEqual([]);
  });

  it("raises a perEquip bonus once per item, up to the reinforcement slot", () => {
    const defs = convert({ dmg: 1.05, requireEquipType: [25], perEquip: 1 });

    expect(defs.map((def) => def.ship)).toEqual([
      "has_gear_type(25)",
      ...[2, 3, 4, 5, 6].map((n) => `count_gear_type(25) >= ${n}`),
    ]);
  });

  it("ignores the exact count outside plane bonuses, like KC3", () => {
    const defs = convert({ dmg: 1.1, requireEquipId: [1], requireEquipIdNumX: 1, perEquip: 1 });

    expect(defs[0].ship).toBe("has(1)");
    expect(defs[1].ship).toBe("count(1) >= 2");
  });

  it("skips bonuses that KC3 marks as unconfirmed", () => {
    expect(convert({ dmg: 1.05, shipBase: [46], unconfirmed: 1 })).toEqual([]);
  });

  it("requires remaining planes of the type for a plane bonus by equipment type", () => {
    const [def] = convert({ dmg: 1.2, requireEquipType: [7], isPlane: 1 });

    expect(def.ship).toBe("count_remaining_planes_by_gear_type(7) >= 1");
  });

  it("requires remaining planes for a bonus with requireSlot", () => {
    const [def] = convert({ dmg: 1.15, requireEquipId: [1], requireSlot: 1 });

    expect(def.ship).toBe("count_remaining_planes(1) >= 1");
    expect(def.aerial_only).toBeUndefined();
  });

  it("keeps the improvement requirement of a bonus with requireSlot", () => {
    const [def] = convert({ dmg: 1.15, requireEquipId: [1], requireSlot: 1, requireEquipLevel: 7 });

    expect(def.ship).toBe("count_by_stars(1, 7) >= 1 && count_remaining_planes(1) >= 1");
  });
});

describe("KC3 debuffs", () => {
  it("applies a debuff without shipId to every enemy", () => {
    const [def] = convertKc3BonusFiles(
      [{ world: 60, mapnum: 1, listDebuff: [{ nodes: ["Z"], debuffs: [{ amount: 10 }] }] }],
      [],
    );

    expect(def).toEqual({ map: 601, node: "Z", debuff: true, armor_penetration: 10 });
  });
});
