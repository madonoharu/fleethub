import { ShipHealth } from "./ShipHealth"

describe("ShipHealth", () => {
  it("constructor", () => {
    expect(new ShipHealth(100)).toMatchObject<Partial<ShipHealth>>({
      maxHp: 100,
      currentHp: 100,
      bounds: { shouha: 75, chuuha: 50, taiha: 25 },
      state: "Normal",
      commonPowerModifier: 1,
      torpedoPowerModifier: 1,
    })

    expect(new ShipHealth(40, 39)).toMatchObject<Partial<ShipHealth>>({
      maxHp: 40,
      currentHp: 39,
      bounds: { shouha: 30, chuuha: 20, taiha: 10 },
      getStateByHp: jest.fn(),
      state: "Normal",
      commonPowerModifier: 1,
      torpedoPowerModifier: 1,
    })
  })

  it.each`
    maxHp  | currentHp | state       | commonPowerModifier | torpedoPowerModifier
    ${100} | ${76}     | ${"Normal"} | ${1}                | ${1}
    ${100} | ${75}     | ${"Shouha"} | ${1}                | ${1}
    ${100} | ${51}     | ${"Shouha"} | ${1}                | ${1}
    ${100} | ${50}     | ${"Chuuha"} | ${0.7}              | ${0.8}
    ${100} | ${26}     | ${"Chuuha"} | ${0.7}              | ${0.8}
    ${100} | ${25}     | ${"Taiha"}  | ${0.4}              | ${0}
    ${100} | ${1}      | ${"Taiha"}  | ${0.4}              | ${0}
    ${100} | ${0}      | ${"Sunk"}   | ${0}                | ${0}
  `(
    "$currentHp/$maxHp -> state: $state, commonPowerModifier: $commonPowerModifier, torpedoPowerModifier: $torpedoPowerModifier ",
    ({ maxHp, currentHp, state, commonPowerModifier, torpedoPowerModifier }) => {
      expect(new ShipHealth(maxHp, currentHp)).toMatchObject<Partial<ShipHealth>>({
        maxHp,
        currentHp,
        bounds: { shouha: 75, chuuha: 50, taiha: 25 },
        state,
        commonPowerModifier,
        torpedoPowerModifier,
      })
    }
  )
})
