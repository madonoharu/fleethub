type SpeedValue = 0 | 5 | 10 | 15 | 20

/**
 * 潜在艦速区分
 */
export enum SpeedGroup {
  FastA,
  FastB1SlowA,
  FastB2SlowB,
  OtherC,
}

/**
 * 速力
 */
export default class Speed {
  public static readonly Land = new Speed(0, "陸上")
  public static readonly Slow = new Speed(5, "低速")
  public static readonly Fast = new Speed(10, "高速")
  public static readonly FastPlus = new Speed(15, "高速+")
  public static readonly Fastest = new Speed(20, "最速")

  public static fromNumber = (value: number): Speed => {
    const found = [Speed.Land, Speed.Slow, Speed.Fast, Speed.FastPlus, Speed.Fastest].find(
      (speed) => value <= speed.value
    )
    return found ? found : Speed.Fastest
  }

  /**
   * 速度上昇値を取得
   * @param group 潜在艦速区分
   * @param enhancedBoilerCount 強化缶の数
   * @param newModelBoilerCount 新型缶の数
   */
  public static getSpeedIncrement(group: SpeedGroup, enhancedBoilerCount: number, newModelBoilerCount: number) {
    const totalBoilerCount = enhancedBoilerCount + newModelBoilerCount
    switch (group) {
      case SpeedGroup.FastA:
        if (newModelBoilerCount >= 1 || totalBoilerCount >= 2) {
          return 10
        }
        break
      case SpeedGroup.FastB1SlowA:
        if (newModelBoilerCount === 0) {
          break
        }
        if (totalBoilerCount >= 3) {
          return 15
        }
        if (totalBoilerCount >= 2) {
          return 10
        }
        break
      case SpeedGroup.FastB2SlowB:
        if (newModelBoilerCount >= 2 || totalBoilerCount >= 3) {
          return 10
        }
        break
    }
    if (totalBoilerCount >= 1) {
      return 5
    }
    return 0
  }

  private constructor(public readonly value: number, public readonly name: string) {}

  /**
   * 加速
   */
  public add = (value: SpeedValue): Speed => {
    return Speed.fromNumber(this.value + value)
  }
}
