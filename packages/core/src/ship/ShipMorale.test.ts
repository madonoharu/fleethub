import { ShipMoraleImpl, MoraleState } from "./ShipMorale"

describe("ShipMoraleImpl", () => {
  it("valueのデフォルトは49", () => {
    expect(new ShipMoraleImpl().value).toBe(49)
  })

  it.each<[number, MoraleState]>([
    [100, "Sparkling"],
    [50, "Sparkling"],
    [49, "Normal"],
    [30, "Normal"],
    [29, "Orange"],
    [20, "Orange"],
    [19, "Red"],
    [0, "Red"],
  ])("morale value %s -> %s", (value, expected) => {
    expect(new ShipMoraleImpl(value).state).toBe(expected)
  })

  const moraleMap = {
    Sparkling: new ShipMoraleImpl(50),
    Normal: new ShipMoraleImpl(30),
    Orange: new ShipMoraleImpl(20),
    Red: new ShipMoraleImpl(0),
  }

  it.each`
    state          | commonAccuracyModifier | torpedoAccuracyModifier | evasionModifier
    ${"Sparkling"} | ${1.2}                 | ${1.3}                  | ${0.7}
    ${"Normal"}    | ${1}                   | ${1}                    | ${1}
    ${"Orange"}    | ${0.8}                 | ${0.7}                  | ${1.2}
    ${"Red"}       | ${0.5}                 | ${0.35}                 | ${1.4}
  `(
    "$state -> 共通命中補正$commonAccuracyModifier, 雷撃命中補正$torpedoAccuracyModifier, 回避補正$evasionModifier",
    ({ state, commonAccuracyModifier, torpedoAccuracyModifier, evasionModifier }) => {
      const morale = moraleMap[state as MoraleState]
      expect(morale.commonAccuracyModifier).toBe(commonAccuracyModifier)
      expect(morale.torpedoAccuracyModifier).toBe(torpedoAccuracyModifier)
      expect(morale.evasionModifier).toBe(evasionModifier)
    }
  )
})
