import { createShipStats, ShipStats, BasicStat, IncreasingStat, ShipStat, ShipLuck, ShipRange } from "./ShipStats"
import { ShipDef, defToData } from "../utils/testUtils"

describe("ShipStats", () => {
  it("createShipStats", () => {
    const base: Parameters<typeof createShipStats>[1] = {
      firepower: [1, 2],
      armor: [3, 4],
      torpedo: [5, 6],
      antiAir: [7, 8],

      asw: [9, 10],
      los: [11, 12],
      evasion: [13, 14],

      maxHp: [15, 16],
      luck: [17, 18],
      range: 1,
      speed: 5,

      shipId: 0,
      shipClass: 0,
      speedGroup: 0,
    }

    const equipment = { sumBy: () => 1, maxValueBy: () => 2, count: () => 0, has: () => false }

    const stats = createShipStats(0, base, equipment, {}, {})

    expect(stats).toMatchObject({
      firepower: { left: 1, right: 2 },
      armor: { left: 3, right: 4 },
      torpedo: { left: 5, right: 6 },
      antiAir: { left: 7, right: 8 },

      asw: { left: 9, right: 10 },
      los: { left: 11, right: 12 },
      evasion: { left: 13, right: 14 },

      luck: { left: 17, right: 18 },
      range: { naked: 1, equipment: 2 },
    })

    expect(stats.firepower).toBeInstanceOf(BasicStat)
    expect(stats.armor).toBeInstanceOf(BasicStat)
    expect(stats.torpedo).toBeInstanceOf(BasicStat)
    expect(stats.antiAir).toBeInstanceOf(BasicStat)

    expect(stats.asw).toBeInstanceOf(IncreasingStat)
    expect(stats.los).toBeInstanceOf(IncreasingStat)
    expect(stats.evasion).toBeInstanceOf(IncreasingStat)

    expect(stats.luck).toBeInstanceOf(ShipLuck)
    expect(stats.range).toBeInstanceOf(ShipRange)
  })

  it("BasicStat", () => {
    expect(new BasicStat("firepower", 1, 2, 3, 4, 5)).toMatchObject<ShipStat>({
      key: "firepower",
      left: 1,
      right: 2,
      equipment: 3,
      modernization: 4,
      bonus: 5,
      naked: 2 + 4,
      displayed: 2 + 4 + 3 + 5,
    })
  })

  it("IncreasingStat", () => {
    expect(new IncreasingStat("asw", 1, 100, 3, 4, 5, 7)).toMatchObject<ShipStat>({
      key: "asw",
      left: 1,
      right: 100,
      equipment: 3,
      modernization: 4,
      bonus: 5,
      naked: ((100 - 1) / 99) * 7 + 1 + 4,
      displayed: ((100 - 1) / 99) * 7 + 1 + 4 + 3 + 5,
    })
  })
})
