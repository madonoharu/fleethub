import { ShipName, ShipType, ShipClass, ShipId } from "@fleethub/data"

import { EquipmentImpl } from "../equipment"
import { makeGear, GearDef, getMasterShip } from "../utils/testUtils"

import {
  createShipEquipmentBonuses,
  getSpeedGroup,
  SpeedGroup,
  SpeedValue,
  calcSpeedBonus,
} from "./ShipEquipmentBonuses"
import { EquipmentBonuses, ShipIdentityWithSpeed } from "./types"

const emptyBonuses: EquipmentBonuses = {
  firepower: 0,
  torpedo: 0,
  antiAir: 0,
  armor: 0,
  evasion: 0,
  asw: 0,
  los: 0,
  bombing: 0,
  accuracy: 0,
  range: 0,
  speed: 0,
  effectiveLos: 0,
}

const getBonuses = (shipName: ShipName, ...gearDefs: GearDef[]) => {
  const ship = getMasterShip(shipName)
  const gears = gearDefs.map(makeGear)
  const equipment = new EquipmentImpl(gears, ship.slots)

  return createShipEquipmentBonuses(ship, equipment).bonuses
}

type Case = {
  args: Parameters<typeof getBonuses>
  expected: Partial<EquipmentBonuses>
}

describe("EquipmentBonuses", () => {
  const cases: Case[] = [
    {
      args: ["占守", "12cm単装砲改二", "22号対水上電探"],
      expected: { firepower: 3, evasion: 5, asw: 1, antiAir: 1 },
    },
    {
      args: ["神風", "12cm単装砲改二", "53cm連装魚雷"],
      expected: { firepower: 4, torpedo: 5, evasion: 5, antiAir: 1 },
    },
    {
      args: ["神風", "12cm単装砲改二", "53cm連装魚雷", "53cm連装魚雷"],
      expected: { firepower: 5, torpedo: 9, evasion: 7, antiAir: 1 },
    },

    { args: ["神風", { name: "12.7cm単装高角砲(後期型)", stars: 6 }], expected: {} },
    { args: ["神風", { name: "12.7cm単装高角砲(後期型)", stars: 7 }], expected: { firepower: 1, antiAir: 1 } },

    {
      args: ["陽炎改二", { name: "61cm四連装(酸素)魚雷後期型", stars: 5 }],
      expected: { torpedo: 3, evasion: 1 },
    },
    {
      args: ["陽炎改二", { name: "61cm四連装(酸素)魚雷後期型", stars: 10 }],
      expected: { firepower: 1, torpedo: 3, evasion: 1 },
    },

    {
      args: ["伊勢改二", { name: "二式艦上偵察機", stars: 1 }],
      expected: { firepower: 3, evasion: 2, armor: 1, accuracy: 5, range: 1 },
    },
    {
      args: ["伊勢改二", { name: "二式艦上偵察機", stars: 10 }],
      expected: { firepower: 5, evasion: 2, armor: 1, los: 3, effectiveLos: 3, accuracy: 5, range: 1 },
    },
    {
      args: ["蒼龍改", { name: "二式艦上偵察機", stars: 6 }],
      expected: { firepower: 4, los: 5, effectiveLos: 5 },
    },

    {
      args: ["大和", "改良型艦本式タービン", "新型高温高圧缶", "強化型艦本式缶"],
      expected: { speed: 10 },
    },
    {
      args: ["大和", "改良型艦本式タービン", "新型高温高圧缶", "強化型艦本式缶", "強化型艦本式缶"],
      expected: { speed: 15 },
    },
  ]

  cases.forEach(({ args, expected }) => {
    const argsStr = args
      .map((arg) => {
        if (typeof arg === "string") return arg
        return `${arg.name}★ ${arg.stars}`
      })
      .join(", ")

    it(`${argsStr} -> ${JSON.stringify(expected)}`, () => {
      expect(getBonuses(...args)).toEqual({ ...emptyBonuses, ...expected })
    })
  })

  it("SG レーダー(初期型)のeffectiveLosボーナスは0", () => {
    expect(getBonuses("Samuel B.Roberts", "SG レーダー(初期型)").effectiveLos).toBe(0)
  })

  it("Samuel B.Roberts, 夕張改二特 はタービンのみで速力ボーナス", () => {
    expect(getBonuses("Samuel B.Roberts", "改良型艦本式タービン").speed).toBe(5)
    expect(getBonuses("夕張改二特", "改良型艦本式タービン").speed).toBe(5)

    expect(getBonuses("夕張改二", "改良型艦本式タービン").speed).toBe(0)
    expect(getBonuses("夕張改二丁", "改良型艦本式タービン").speed).toBe(0)
  })
})

describe("getSpeedGroup", () => {
  const getShip = (arg: Partial<ShipIdentityWithSpeed>): ShipIdentityWithSpeed => ({
    shipId: 0,
    shipClass: 0,
    shipType: 0,
    name: "",
    ruby: "",
    sortId: 0,
    speed: 0,
    ...arg,
  })

  it("高速水母 -> SpeedGroup.OtherC", () => {
    expect(getSpeedGroup(getShip({ shipType: ShipType.AV, speed: SpeedValue.Fast }))).toBe(SpeedGroup.OtherC)
    expect(getSpeedGroup(getShip({ shipType: ShipType.AV, speed: SpeedValue.Slow }))).not.toBe(SpeedGroup.OtherC)
  })
  it("潜水艦 -> SpeedGroup.OtherC", () => {
    expect(getSpeedGroup(getShip({ shipType: ShipType.SS }))).toBe(SpeedGroup.OtherC)
    expect(getSpeedGroup(getShip({ shipType: ShipType.SSV }))).toBe(SpeedGroup.OtherC)
  })

  it("夕張, 夕張改 -> SpeedGroup.OtherC", () => {
    expect(getSpeedGroup(getShip({ shipId: ShipId["夕張"] }))).toBe(SpeedGroup.OtherC)
    expect(getSpeedGroup(getShip({ shipId: ShipId["夕張改"] }))).toBe(SpeedGroup.OtherC)
  })

  it("夕張改二, 夕張改二特, 夕張改二丁 -> SpeedGroup.FastB2SlowB", () => {
    expect(getSpeedGroup(getShip({ shipId: ShipId["夕張改二"] }))).toBe(SpeedGroup.FastB2SlowB)
    expect(getSpeedGroup(getShip({ shipId: ShipId["夕張改二特"] }))).toBe(SpeedGroup.FastB2SlowB)
    expect(getSpeedGroup(getShip({ shipId: ShipId["夕張改二丁"] }))).toBe(SpeedGroup.FastB2SlowB)
  })

  it("加賀型, 暁型, 工作艦, 改風早型 -> SpeedGroup.OtherC", () => {
    const shipClasses = [
      ShipClass.KagaClass,
      ShipClass.AkatsukiClass,
      ShipClass.RepairShip,
      ShipClass.RevisedKazahayaClass,
    ]
    shipClasses.forEach((shipClass) => {
      expect(getSpeedGroup(getShip({ shipClass }))).toBe(SpeedGroup.OtherC)
    })
  })

  it("島風型, Ташкент級, 大鳳型, 翔鶴型, 利根型, 最上型 -> SpeedGroup.FastA", () => {
    const shipClasses = [
      ShipClass.ShimakazeClass,
      ShipClass.TashkentClass,
      ShipClass.TaihouClass,
      ShipClass.ShoukakuClass,
      ShipClass.ToneClass,
      ShipClass.MogamiClass,
    ]
    shipClasses.forEach((shipClass) => {
      expect(getSpeedGroup(getShip({ shipClass }))).toBe(SpeedGroup.FastA)
    })
  })

  it("阿賀野型, 蒼龍型, 飛龍型, 金剛型, 大和型, Iowa級 -> SpeedGroup.FastB1SlowA", () => {
    const shipClasses = [
      ShipClass.AganoClass,
      ShipClass.SouryuuClass,
      ShipClass.HiryuuClass,
      ShipClass.KongouClass,
      ShipClass.YamatoClass,
      ShipClass.IowaClass,
    ]
    shipClasses.forEach((shipClass) => {
      expect(getSpeedGroup(getShip({ shipClass }))).toBe(SpeedGroup.FastB1SlowA)
    })
  })

  it("読み仮名が あまつかぜ, うんりゅう, あまぎ -> SpeedGroup.FastB1SlowA", () => {
    expect(getSpeedGroup(getShip({ ruby: "あまつかぜ" }))).toBe(SpeedGroup.FastB1SlowA)
    expect(getSpeedGroup(getShip({ ruby: "うんりゅう" }))).toBe(SpeedGroup.FastB1SlowA)
    expect(getSpeedGroup(getShip({ ruby: "あまぎ" }))).toBe(SpeedGroup.FastB1SlowA)
  })

  it("長門改二 -> SpeedGroup.FastB1SlowA", () => {
    expect(getSpeedGroup(getShip({ shipId: ShipId["長門改二"] }))).toBe(SpeedGroup.FastB1SlowA)
  })
})

describe("calcSpeedBonus", () => {
  it("タービンが無いなら0", () => {
    expect(
      calcSpeedBonus({
        speedGroup: SpeedGroup.FastA,
        hasTurbine: false,
        enhancedBoilerCount: 5,
        newModelBoilerCount: 5,
        hasSpecialBonus: true,
      })
    ).toBe(0)
  })

  it("hasSpecialBonus が true ならタービンだけで+5", () => {
    expect(
      calcSpeedBonus({
        speedGroup: SpeedGroup.OtherC,
        hasTurbine: true,
        enhancedBoilerCount: 0,
        newModelBoilerCount: 0,
        hasSpecialBonus: true,
      })
    ).toBe(5)
  })

  describe("SpeedGroup.FastA", () => {
    it.each<[number, number, number]>([
      [0, 0, 0],
      [0, 1, 5],
      [0, 2, 10],
      [1, 0, 10],
    ])("新型高温高圧缶%s, 強化型艦本式缶%s -> %s", (newModelBoilerCount, enhancedBoilerCount, expected) => {
      expect(
        calcSpeedBonus({
          speedGroup: SpeedGroup.FastA,

          enhancedBoilerCount,
          newModelBoilerCount,
          hasTurbine: true,
          hasSpecialBonus: false,
        })
      ).toBe(expected)
    })
  })

  describe("SpeedGroup.FastB1SlowA", () => {
    it.each<[number, number, number]>([
      [0, 0, 0],
      [0, 1, 5],
      [0, 5, 5],
      [1, 0, 5],
      [1, 1, 10],
      [2, 0, 10],
    ])("新型高温高圧缶%s, 強化型艦本式缶%s -> %s", (newModelBoilerCount, enhancedBoilerCount, expected) => {
      expect(
        calcSpeedBonus({
          speedGroup: SpeedGroup.FastB1SlowA,

          enhancedBoilerCount,
          newModelBoilerCount,
          hasTurbine: true,
          hasSpecialBonus: false,
        })
      ).toBe(expected)
    })
  })

  describe("SpeedGroup.FastB2SlowB", () => {
    it.each<[number, number, number]>([
      [0, 0, 0],
      [0, 1, 5],
      [0, 3, 10],
      [1, 0, 5],
      [1, 1, 5],
      [1, 2, 10],
      [2, 0, 10],
    ])("新型高温高圧缶%s, 強化型艦本式缶%s -> %s", (newModelBoilerCount, enhancedBoilerCount, expected) => {
      expect(
        calcSpeedBonus({
          speedGroup: SpeedGroup.FastB2SlowB,

          enhancedBoilerCount,
          newModelBoilerCount,
          hasTurbine: true,
          hasSpecialBonus: false,
        })
      ).toBe(expected)
    })
  })

  describe("SpeedGroup.OtherC", () => {
    it.each<[number, number, number]>([
      [0, 0, 0],
      [5, 5, 5],
    ])("新型高温高圧缶%s, 強化型艦本式缶%s -> %s", (newModelBoilerCount, enhancedBoilerCount, expected) => {
      expect(
        calcSpeedBonus({
          speedGroup: SpeedGroup.OtherC,

          enhancedBoilerCount,
          newModelBoilerCount,
          hasTurbine: true,
          hasSpecialBonus: false,
        })
      ).toBe(expected)
    })
  })
})
