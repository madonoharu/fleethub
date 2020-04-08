import { createGearAttrs, GearAttribute } from "./GearAttribute"
import { GearCategory, GearName, GearData } from "@fleethub/data"

import { getGearData } from "../utils/testUtils"

const defaultStats: Required<GearData> = {
  id: 0,

  category: 0,
  iconId: 0,
  name: "",

  hp: 0,
  firepower: 0,
  armor: 0,
  torpedo: 0,
  antiAir: 0,
  speed: 0,
  bombing: 0,
  asw: 0,
  los: 0,
  luck: 0,
  accuracy: 0,
  evasion: 0,
  antiBomber: 0,
  interception: 0,
  range: 0,
  radius: 0,
  cost: 0,

  improvable: false,
}

const toRequiredGearData = (data: Partial<GearData>): Required<GearData> => ({ ...defaultStats, ...data })

type GearDef = Partial<GearData> | GearName

const defToData = (def: GearDef): Required<GearData> => {
  if (typeof def === "string") {
    return toRequiredGearData(getGearData(def))
  }
  return toRequiredGearData(def)
}

type ExpectedLine = [GearDef, GearAttribute] | [GearDef, "not", GearAttribute]

type ExpectedTable = ExpectedLine[]

describe("GearAttribute", () => {
  it("createGearAttrs", () => {
    expect(createGearAttrs(defToData({})).length).toBe(0)

    const table: ExpectedTable = [
      [{ id: 501 }, "Abyssal"],
      [{ id: 500 }, "not", "Abyssal"],

      [{ iconId: 16 }, "HighAngleMount"],

      [{ category: GearCategory.SmallCaliberMainGun }, "MainGun"],
      [{ category: GearCategory.MediumCaliberMainGun }, "MainGun"],
      [{ category: GearCategory.LargeCaliberMainGun }, "MainGun"],

      [{ category: GearCategory.SmallRadar }, "Radar"],
      [{ category: GearCategory.LargeRadar }, "Radar"],

      [{ category: GearCategory.SmallRadar, los: 5 }, "SurfaceRadar"],
      [{ category: GearCategory.LargeRadar, los: 5 }, "SurfaceRadar"],
      [{ category: GearCategory.SmallRadar, los: 4 }, "not", "SurfaceRadar"],
      [{ category: GearCategory.LargeRadar, los: 4 }, "not", "SurfaceRadar"],

      [{ category: GearCategory.SmallRadar, antiAir: 2 }, "AirRadar"],
      [{ category: GearCategory.LargeRadar, antiAir: 2 }, "AirRadar"],
      [{ category: GearCategory.SmallRadar, antiAir: 1 }, "not", "AirRadar"],
      [{ category: GearCategory.LargeRadar, antiAir: 1 }, "not", "AirRadar"],

      [{ category: GearCategory.ExtraArmor }, "Armor"],
      [{ category: GearCategory.MediumExtraArmor }, "Armor"],
      [{ category: GearCategory.LargeExtraArmor }, "Armor"],

      [{ category: GearCategory.Sonar }, "AswGear"],
      [{ category: GearCategory.DepthCharge }, "AswGear"],
      [{ category: GearCategory.LargeSonar }, "AswGear"],
      [{ category: GearCategory.CarrierBasedDiveBomber }, "AswGear"],
      [{ category: GearCategory.CarrierBasedTorpedoBomber }, "AswGear"],
      [{ category: GearCategory.SeaplaneBomber }, "AswGear"],
      [{ category: GearCategory.Autogyro }, "AswGear"],
      [{ category: GearCategory.AntiSubmarinePatrolAircraft }, "AswGear"],

      [{ category: GearCategory.CarrierBasedDiveBomber, asw: 1 }, "AswAircraft"],
      [{ category: GearCategory.CarrierBasedTorpedoBomber, asw: 1 }, "AswAircraft"],
      [{ category: GearCategory.SeaplaneBomber, asw: 1 }, "AswAircraft"],
      [{ category: GearCategory.Autogyro, asw: 1 }, "AswAircraft"],
      [{ category: GearCategory.AntiSubmarinePatrolAircraft, asw: 1 }, "AswAircraft"],
      [{ category: GearCategory.LargeFlyingBoat, asw: 1 }, "AswAircraft"],
      [{ category: GearCategory.CarrierBasedDiveBomber, asw: 0 }, "not", "AswAircraft"],

      ["九四式爆雷投射機", "DepthChargeProjector"],
      ["三式爆雷投射機", "DepthChargeProjector"],

      ["九五式爆雷", "AdditionalDepthCharge"],
      ["二式爆雷", "AdditionalDepthCharge"],

      ["二式12cm迫撃砲改", "Mortar"],
      ["二式12cm迫撃砲改 集中配備", "Mortar"],

      ["艦載型 四式20cm対地噴進砲", "AntiGroundRocketLauncher"],
      ["四式20cm対地噴進砲 集中配備", "AntiGroundRocketLauncher"],
    ]

    table.forEach((line) => {
      const data = defToData(line[0])

      if (line[1] === "not") {
        expect(createGearAttrs(data)).not.toContain<GearAttribute>(line[2])
      } else {
        expect(createGearAttrs(data)).toContain<GearAttribute>(line[1])
      }
    })
  })
})
