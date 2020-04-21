import { calcObservationTerm } from "./DaySpecialAttack"
import { AirControlState } from "../../common"

describe("観測項", () => {
  const luck = 10
  const equipmentLos = 12
  const fleetLosModifier = 20

  const baseParams = {
    luck,
    equipmentLos,
    fleetLosModifier,
    isFlagship: false,
  }

  it("制空確保", () => {
    const params = { ...baseParams, airControlState: AirControlState.AirSupremacy }
    const expected = Math.floor(Math.floor(Math.sqrt(luck) + 10) + 0.7 * (fleetLosModifier + 1.6 * equipmentLos) + 10)

    expect(calcObservationTerm(params)).toBe(expected)
    expect(calcObservationTerm({ ...params, isFlagship: true })).toBe(expected + 15)
  })
  it("制空優勢", () => {
    const params = { ...baseParams, airControlState: AirControlState.AirSuperiority }
    const expected = Math.floor(Math.floor(Math.sqrt(luck) + 10) + 0.6 * (fleetLosModifier + 1.2 * equipmentLos))

    expect(calcObservationTerm(params)).toBe(expected)
    expect(calcObservationTerm({ ...params, isFlagship: true })).toBe(expected + 15)
  })

  it("制空均衡以下では観測項は0", () => {
    expect(calcObservationTerm({ ...baseParams, airControlState: AirControlState.AirParity })).toBe(0)
    expect(calcObservationTerm({ ...baseParams, airControlState: AirControlState.AirDenial })).toBe(0)
    expect(calcObservationTerm({ ...baseParams, airControlState: AirControlState.AirIncapability })).toBe(0)
  })
})
