import { createShipStats } from "./createShipStats"

import { ShipStatsBase, ShipStatsState, BasicStatKey, EquipmentBonuses } from "../types"
import { EquipmentMock } from "../../utils"

import { ShipBasicStat, ShipBasicStatWithLevel } from "./ShipBasicStat"
import { ShipLuck } from "./ShipLuck"
import { ShipSpeed } from "./ShipSpeed"
import { ShipRange } from "./ShipRange"
import { ShipMaxHp } from "./ShipMaxHp"
import { ShipHealth } from "./ShipHealth"
import { ShipMorale } from "./ShipMorale"
import { ShipAmmo } from "./ShipAmmo"
import { ShipAccuracy } from "./ShipAccuracy"

describe("createShipStats", () => {
  const base: ShipStatsBase = {
    firepower: [110, 120],
    torpedo: [210, 220],
    antiAir: [310, 320],
    armor: [410, 420],
    asw: [510, 520],
    los: [610, 620],
    evasion: [710, 720],

    maxHp: [100, 200],
    luck: [810, 110],
    speed: 10,
    range: 1,
    ammo: 120,
    fuel: 130,
  }

  const level = 175

  const state: ShipStatsState = {
    level,
    maxHp: 2,
    currentHp: 100,
    morale: 48,

    firepower: 11,
    torpedo: 12,
    antiAir: 13,
    armor: 14,
    asw: 15,
    los: 16,
    evasion: 17,
    luck: 18,
  }

  const equipment = new EquipmentMock()
  equipment.sumBy.mockReturnValue(1)
  equipment.maxValueBy.mockReturnValue(2)

  const bonuses: EquipmentBonuses = {
    firepower: 21,
    torpedo: 22,
    antiAir: 23,
    armor: 24,
    asw: 25,
    los: 26,
    evasion: 27,
    bombing: 8,
    accuracy: 9,
    range: 3,
    speed: 5,
    effectiveLos: 10,
  }

  const stats = createShipStats(base, state, equipment, bonuses)

  it("levelのデフォルト値は99", () => {
    expect(createShipStats(base, {}, equipment, bonuses).level).toBe(99)
  })

  it("state.level -> level", () => {
    expect(stats.level).toBe(level)
  })

  it.each<BasicStatKey>(["firepower", "torpedo", "antiAir", "armor"])("%s -> ShipBasicStat", (key) => {
    expect(stats[key]).toEqual(new ShipBasicStat(base[key], 1, state[key], bonuses[key]))
  })

  it.each<BasicStatKey>(["asw", "los", "evasion"])("%s -> ShipBasicStatWithLevel", (key) => {
    expect(stats[key]).toEqual(new ShipBasicStatWithLevel(level, base[key], 1, state[key], bonuses[key]))
  })

  it("stats.maxHp -> ShipMaxHp", () => {
    expect(stats.maxHp).toEqual(new ShipMaxHp(base.maxHp, state.maxHp, level >= 100))
  })

  it("stats.luck -> ShipLuck", () => {
    expect(stats.luck).toEqual(new ShipLuck(base.luck, state.luck))
  })

  it("stats.speed -> ShipSpeed", () => {
    expect(stats.speed).toEqual(new ShipSpeed(base.speed, bonuses.speed))
  })

  it("stats.range -> ShipRange", () => {
    expect(stats.range).toEqual(new ShipRange(base.range, 2, bonuses.range))
  })

  it("stats.accuracy -> ShipAccuracy", () => {
    expect(stats.accuracy).toEqual(new ShipAccuracy(1, bonuses.accuracy))
  })

  it("stats.health -> ShipHealth", () => {
    expect(stats.health).toEqual(new ShipHealth(stats.maxHp.displayed, state.currentHp))
  })

  it("stats.morale -> ShipMorale", () => {
    expect(stats.morale).toEqual(new ShipMorale(state.morale))
  })

  it("stats.ammo -> ShipAmmo", () => {
    expect(stats.ammo).toEqual(new ShipAmmo(base.ammo, state.ammo))
  })

  it("stats.fuel -> ShipFuel", () => {
    expect(stats.fuel).toEqual(new ShipAmmo(base.fuel, state.fuel))
  })
})
