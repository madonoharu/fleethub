import MasterGear from "./MasterGear"
import { GearData, GearCategory2 } from "@fleethub/data"
import { getGearData } from "../utils/testUtils"

describe("MasterGear", () => {
  it("constructor", () => {
    const data: Required<GearData> = {
      id: 1,
      category: 2,
      iconId: 3,
      name: "test",

      firepower: 4,
      armor: 5,
      torpedo: 6,
      antiAir: 7,
      bombing: 8,
      asw: 9,
      los: 10,

      accuracy: 11,
      evasion: 12,
      antiBomber: 13,
      interception: 14,

      range: 15,
      radius: 16,
      cost: 17,

      improvable: true,

      hp: 18,
      speed: 19,
      luck: 20,
    }
    const master = new MasterGear(data)

    expect(master).toMatchObject(data)
  })

  it("equippableCategory", () => {
    expect(new MasterGear(getGearData("試製51cm連装砲")).equippableCategory).toBe(GearCategory2.LargeCaliberMainGun2)
    expect(new MasterGear(getGearData("51cm連装砲")).equippableCategory).toBe(GearCategory2.LargeCaliberMainGun2)

    expect(new MasterGear(getGearData("15m二重測距儀+21号電探改二")).equippableCategory).toBe(GearCategory2.LargeRadar2)

    expect(new MasterGear(getGearData("試製景雲(艦偵型)")).equippableCategory).toBe(
      GearCategory2.CarrierBasedReconnaissanceAircraft2
    )
  })
})
