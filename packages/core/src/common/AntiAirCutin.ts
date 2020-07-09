const data: Array<[number, number, number, number]> = [
  [1, 8, 1.7, 65],
  [2, 7, 1.7, 58],
  [3, 5, 1.6, 50],
  [4, 7, 1.5, 52],
  [5, 5, 1.5, 55],
  [6, 5, 1.45, 40],
  [7, 4, 1.35, 45],
  [8, 5, 1.4, 50],
  [9, 3, 1.3, 40],
  [10, 9, 1.65, 60],
  [11, 7, 1.5, 55],
  [12, 4, 1.25, 45],
  [13, 5, 1.35, 35],
  [14, 5, 1.45, 63],
  [15, 4, 1.3, 58],
  [16, 5, 1.4, 60],
  [17, 3, 1.25, 55],
  [18, 3, 1.2, 60],
  [19, 6, 1.45, 55],
  [20, 4, 1.25, 70],
  [21, 6, 1.45, 60],
  [22, 3, 1.2, 63],
  [23, 2, 1.05, 80],
  [24, 4, 1.25, 60],
  [25, 8, 1.55, 60],
  [26, 7, 1.4, 60],
  [28, 5, 1.4, 53],
  [29, 6, 1.55, 58],
  [30, 4, 1.3, 42],
  [31, 3, 1.25, 50],
  [32, 4, 1.2, 32],
  [33, 4, 1.35, 42],
  [34, 8, 1.6, 60],
  [35, 7, 1.55, 53],
  [36, 7, 1.55, 59],
  [37, 5, 1.45, 38],
  [39, 11, 1.7, 60],
  [40, 11, 1.7, 60],
  [41, 10, 1.65, 60],
]

/** 対空カットイン */
export default class AntiAirCutin {
  public static readonly all = data.map((datum) => new AntiAirCutin(...datum))

  public static fromId = (id: number) => AntiAirCutin.all.find((aaci) => aaci.id === id)

  private constructor(
    public readonly id: number,
    /** 最低保証 */
    public readonly minimumBonus: number,
    /** 変動ボーナス */
    public readonly fixedAirDefenseModifier: number,
    /** 発動定数 */
    public readonly baseRate: number
  ) {}

  get intrinsicRate() {
    return this.baseRate / 101
  }

  get isSpecial() {
    return [34, 35, 39, 40, 41].includes(this.id)
  }

  get name() {
    return this.id + "種"
  }
}
