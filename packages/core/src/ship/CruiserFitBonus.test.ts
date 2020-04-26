import { calcCruiserFitBonus } from "./CruiserFitBonus"

describe("calcCruiserFitBonus", () => {
  it("軽巡級 -> sqrt(単装砲の数) + 2 * sqrt(連装砲の数)", () => {
    expect(
      calcCruiserFitBonus({
        isLightCruiserClass: true,
        singleGunCount: 2,
        twinGunCount: 3,
        isZaraClass: false,
        zaraGunCount: 0,
      })
    ).toBe(Math.sqrt(2) + 2 * Math.sqrt(3))
  })

  it("Zara級 -> sqrt(Zara砲の数)", () => {
    expect(
      calcCruiserFitBonus({
        isLightCruiserClass: false,
        singleGunCount: 0,
        twinGunCount: 0,
        isZaraClass: true,
        zaraGunCount: 2,
      })
    ).toBe(Math.sqrt(2))
  })
})
