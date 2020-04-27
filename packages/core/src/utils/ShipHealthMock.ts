import { Health, HealthDamage } from "../ship/Health"

export default class ShipHealthMock implements Health {
  maxHp = NaN
  currentHp = NaN
  damage: HealthDamage = "Less"
  gte = jest.fn()
  lte = jest.fn()

  shellingPowerModifier = NaN
  torpedoPowerModifier = NaN
  aswPowerModifier = NaN
  nightPowerModifier = NaN
}
