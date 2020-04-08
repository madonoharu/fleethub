/** 交戦形態 */
export default class Engagement {
  public static readonly values: Engagement[] = []

  public static readonly Parallel = new Engagement(1, "同航戦", 1)
  public static readonly HeadOn = new Engagement(2, "反航戦", 0.8)
  public static readonly CrossingTheTAdvantage = new Engagement(3, "T有利", 1.2)
  public static readonly CrossingTheTDisadvantage = new Engagement(4, "T不利", 0.6)

  public static random = (hasSaiun = false) => {
    const value = Math.random()
    if (value < 0.15) {
      return Engagement.CrossingTheTAdvantage
    }
    if (value < 0.6) {
      return Engagement.Parallel
    }
    if (value < 0.9) {
      return Engagement.HeadOn
    }
    return hasSaiun ? Engagement.HeadOn : Engagement.CrossingTheTDisadvantage
  }

  private constructor(public readonly id: number, public readonly name: string, public readonly modifier: number) {
    Engagement.values.push(this)
  }
}
