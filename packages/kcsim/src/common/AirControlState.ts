/** 制空 */
export default class AirControlState {
  public static readonly values: AirControlState[] = []

  public static readonly AirSupremacy = new AirControlState(1, "制空権確保", 1)
  public static readonly AirSuperiority = new AirControlState(2, "航空優勢", 3)
  public static readonly AirParity = new AirControlState(0, "制空均衡", 5)
  public static readonly AirDenial = new AirControlState(3, "航空劣勢", 7)
  public static readonly AirIncapability = new AirControlState(4, "制空権喪失", 10)

  public static getBoundaryValues = (fp: number) => {
    return {
      AirSupremacy: Math.ceil(3 * fp),
      AirSuperiority: Math.ceil(1.5 * fp),
      AirParity: Math.floor((2 / 3) * fp) + 1,
      AirDenial: Math.floor((1 / 3) * fp) + 1
    }
  }

  public static fromFighterPower(allied: number, enemy: number) {
    const bounds = AirControlState.getBoundaryValues(enemy)
    if (allied >= bounds.AirSupremacy) {
      return AirControlState.AirSupremacy
    }
    if (allied >= bounds.AirSuperiority) {
      return AirControlState.AirSuperiority
    }
    if (allied >= bounds.AirParity) {
      return AirControlState.AirParity
    }
    if (allied >= bounds.AirDenial) {
      return AirControlState.AirDenial
    }
    return AirControlState.AirIncapability
  }

  public static fromId(id: number) {
    return AirControlState.values.find(airState => airState.id === id)
  }

  private constructor(public readonly id: number, public readonly name: string, public readonly constant: number) {
    AirControlState.values.push(this)
  }

  get contactMultiplier() {
    switch (this) {
      case AirControlState.AirSupremacy:
        return 3
      case AirControlState.AirSuperiority:
        return 2
      case AirControlState.AirDenial:
        return 1
      default:
        return 0
    }
  }
}
