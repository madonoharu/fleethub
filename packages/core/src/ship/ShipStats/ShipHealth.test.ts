import { ShipHealth } from "./ShipHealth"

describe("ShipHealth", () => {
  it("constructor", () => {
    expect(new ShipHealth(100)).toMatchObject<ShipHealth>({
      maxHp: 100,
      currentHp: 100,
      damage: "Less",
      commonPowerModifier: 1,
      torpedoPowerModifier: 1,
    })

    expect(new ShipHealth(40, 39)).toMatchObject<ShipHealth>({
      maxHp: 40,
      currentHp: 39,
      damage: "Less",
      commonPowerModifier: 1,
      torpedoPowerModifier: 1,
    })
  })

  it.each`
    maxHp  | currentHp | damage      | commonPowerModifier | torpedoPowerModifier
    ${100} | ${76}     | ${"Less"}   | ${1}                | ${1}
    ${100} | ${75}     | ${"Shouha"} | ${1}                | ${1}
    ${100} | ${51}     | ${"Shouha"} | ${1}                | ${1}
    ${100} | ${50}     | ${"Chuuha"} | ${0.7}              | ${0.8}
    ${100} | ${26}     | ${"Chuuha"} | ${0.7}              | ${0.8}
    ${100} | ${25}     | ${"Taiha"}  | ${0.4}              | ${0}
    ${100} | ${1}      | ${"Taiha"}  | ${0.4}              | ${0}
    ${100} | ${0}      | ${"Sunk"}   | ${0}                | ${0}
  `(
    "$currentHp/$maxHp -> damage: $damage, commonPowerModifier: $commonPowerModifier, torpedoPowerModifier: $torpedoPowerModifier ",
    ({ maxHp, currentHp, damage, commonPowerModifier, torpedoPowerModifier }) => {
      expect(new ShipHealth(maxHp, currentHp)).toMatchObject<ShipHealth>({
        maxHp,
        currentHp,
        damage,
        commonPowerModifier,
        torpedoPowerModifier,
      })
    }
  )
})
