import { calcObservationTerm } from "./DaySpecialAttack"

describe("観測項", () => {
  const luck = 10
  const equipmentLos = 12
  const fleetLosModifier = 20

  const baseParams = {
    luck,
    equipmentLos,
    fleetLosModifier,
    isMainFlagship: false,
  }

  it("制空確保", () => {
    const params = { ...baseParams, airState: "AirSupremacy" } as const
    const expected = Math.floor(Math.floor(Math.sqrt(luck) + 10) + 0.7 * (fleetLosModifier + 1.6 * equipmentLos) + 10)

    expect(calcObservationTerm(params)).toBe(expected)
    expect(calcObservationTerm({ ...params, isMainFlagship: true })).toBe(expected + 15)
  })
  it("制空優勢", () => {
    const params = { ...baseParams, airState: "AirSuperiority" } as const
    const expected = Math.floor(Math.floor(Math.sqrt(luck) + 10) + 0.6 * (fleetLosModifier + 1.2 * equipmentLos))

    expect(calcObservationTerm(params)).toBe(expected)
    expect(calcObservationTerm({ ...params, isMainFlagship: true })).toBe(expected + 15)
  })

  it("制空均衡以下では観測項は0", () => {
    expect(calcObservationTerm({ ...baseParams, airState: "AirParity" })).toBe(0)
    expect(calcObservationTerm({ ...baseParams, airState: "AirDenial" })).toBe(0)
    expect(calcObservationTerm({ ...baseParams, airState: "AirIncapability" })).toBe(0)
  })
})
