import { randint, range, NumberRecord } from "@fleethub/utils"

export default class ProtectionDamage {
  static calc = (currentHp: number, randomValue: number) => {
    return Math.floor(currentHp * 0.5 + randomValue * 0.3)
  }

  constructor(private currentHp: number) {}

  public calc(randomValue: number) {
    return ProtectionDamage.calc(this.currentHp, randomValue)
  }

  public min() {
    return this.calc(0)
  }

  public max() {
    return this.calc(this.currentHp - 1)
  }

  public random() {
    return this.calc(randint(this.currentHp - 1))
  }

  public values() {
    return range(this.currentHp).map((value) => this.calc(value))
  }

  public toDistribution() {
    return NumberRecord.rfd(this.values())
  }
}
