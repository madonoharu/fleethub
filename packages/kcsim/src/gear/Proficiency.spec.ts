import Proficiency from "./Proficiency"

describe("Proficiency", () => {
  it("expToLevel", () => {
    const expLevelTable = [
      [0, 0],
      [9, 0],
      [24, 1],
      [25, 2],
      [39, 2],
      [40, 3],
      [54, 3],
      [55, 4],
      [69, 4],
      [70, 5],
      [84, 5],
      [85, 6],
      [99, 6],
      [100, 7],
      [120, 7],
    ]
    expLevelTable.forEach(([exp, expected]) => {
      expect(Proficiency.expToLevel(exp)).toBe(expected)
      expect(new Proficiency(exp, "Fighter").level).toBe(expected)
    })
  })

  it("fighterPowerModifier", () => {
    const fighterTable = [
      [0, 0],
      [24, Math.sqrt(24 / 10)],
      [25, Math.sqrt(25 / 10) + 2],
      [39, Math.sqrt(39 / 10) + 2],
      [40, Math.sqrt(40 / 10) + 5],
      [54, Math.sqrt(54 / 10) + 5],
      [55, Math.sqrt(55 / 10) + 9],
      [69, Math.sqrt(69 / 10) + 9],
      [70, Math.sqrt(70 / 10) + 14],
      [99, Math.sqrt(99 / 10) + 14],
      [100, Math.sqrt(100 / 10) + 22],
      [120, Math.sqrt(120 / 10) + 22],
    ]
    fighterTable.forEach(([exp, expected]) => {
      expect(new Proficiency(exp, "Fighter").fighterPowerModifier).toBe(expected)
    })

    const seaplaneBomberTable = [
      [0, 0],
      [24, Math.sqrt(24 / 10)],
      [25, Math.sqrt(25 / 10) + 1],
      [69, Math.sqrt(69 / 10) + 1],
      [70, Math.sqrt(70 / 10) + 3],
      [99, Math.sqrt(99 / 10) + 3],
      [100, Math.sqrt(100 / 10) + 6],
      [120, Math.sqrt(120 / 10) + 6],
    ]
    seaplaneBomberTable.forEach(([exp, expected]) => {
      expect(new Proficiency(exp, "SeaplaneBomber").fighterPowerModifier).toBe(expected)
    })

    expect(new Proficiency(120, "Other").fighterPowerModifier).toBe(Math.sqrt(120 / 10))
  })
})
