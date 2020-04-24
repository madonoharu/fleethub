import { getApShellModifiers, getShellingType } from "./ShellingParams"
import { ShipClass } from "@fleethub/data"

describe("getApShellModifiers", () => {
  type Expected = ReturnType<typeof getApShellModifiers>

  it("徹甲弾補正は徹甲弾と主砲が必要", () => {
    const expected: Expected = { power: 1, accuracy: 1 }

    expect(getApShellModifiers({ hasApShell: false, hasMainGun: true, hasRader: true, hasSecondaryGun: true })).toEqual(
      expected
    )

    expect(getApShellModifiers({ hasApShell: true, hasMainGun: false, hasRader: true, hasSecondaryGun: true })).toEqual(
      expected
    )
  })
  it.each<[boolean, boolean, Expected]>([
    [false, false, { power: 1, accuracy: 1 }],
    [true, false, { power: 1, accuracy: 1 }],
    [false, true, { power: 1, accuracy: 1 }],
    [true, true, { power: 1, accuracy: 1 }],
  ])("電探%s, 副砲%s -> %s", (hasRader, hasSecondaryGun, expected) => {
    const modifiers = getApShellModifiers({ hasApShell: true, hasMainGun: false, hasRader, hasSecondaryGun })
    expect(modifiers).toEqual(expected)
  })
})

describe("getShellingType", () => {
  const defaultParams = {
    isAircraftCarrierClass: false,
    isInstallation: false,
    shipClass: 0,
    hasCarrierShellingPlane: false,
  }
  it("空母 -> CarrierShelling", () => {
    expect(getShellingType({ ...defaultParams, isAircraftCarrierClass: true })).toBe("CarrierShelling")

    expect(getShellingType(defaultParams)).toBe("Shelling")
  })
  it("陸上かつ空撃機 -> CarrierShelling", () => {
    expect(getShellingType({ ...defaultParams, isInstallation: true, hasCarrierShellingPlane: true })).toBe(
      "CarrierShelling"
    )

    expect(getShellingType({ ...defaultParams, hasCarrierShellingPlane: true })).toBe("Shelling")
    expect(getShellingType({ ...defaultParams, isInstallation: true })).toBe("Shelling")
    expect(getShellingType(defaultParams)).toBe("Shelling")
  })

  it("速吸かつ空撃機 -> CarrierShelling", () => {
    expect(
      getShellingType({ ...defaultParams, shipClass: ShipClass.RevisedKazahayaClass, hasCarrierShellingPlane: true })
    ).toBe("CarrierShelling")

    expect(getShellingType({ ...defaultParams, hasCarrierShellingPlane: true })).toBe("Shelling")
    expect(getShellingType({ ...defaultParams, shipClass: ShipClass.RevisedKazahayaClass })).toBe("Shelling")
    expect(getShellingType(defaultParams)).toBe("Shelling")
  })
})
