import { calcShellingPower, ShellingPowerParams } from "./ShellingPower"

describe("calcShellingPower", () => {
  it("basic = 5 + firepower + improvementBonus + fleetFactor", () => {
    const firepower = 1
    const improvementBonus = 1.5
    const fleetFactor = 3
    const { basic } = calcShellingPower({ firepower, improvementBonus, fleetFactor })
    const expected = 5 + firepower + improvementBonus + fleetFactor

    expect(basic).toBe(expected)
  })

  it("precap = basic * formationModifier * engagementModifier * healthModifier +", () => {
    const basic = 5
    const formationModifier = 0.8
    const { precap } = calcShellingPower({ formationModifier: 0.8 })

    expect(precap).toBe(basic * formationModifier)
  })
})
