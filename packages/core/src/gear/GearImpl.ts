import { GearState, GearBase, Gear, ImprovementBonuses, Proficiency } from "./types"

export class GearImpl implements Gear {
  public readonly gearId = this.state.gearId
  public readonly stars = this.state.stars || 0
  public readonly exp = this.state.exp || 0

  public readonly types = this.base.types
  public readonly name = this.base.name
  public readonly categoryId = this.base.categoryId
  public readonly iconId = this.base.iconId
  public readonly specialType2 = this.base.specialType2
  public readonly attrs = this.base.attrs
  public readonly isAbyssal = this.base.isAbyssal

  public readonly categoryIs = this.base.categoryIs
  public readonly categoryIn = this.base.categoryIn
  public readonly is = this.base.is
  public readonly in = this.base.in

  public readonly firepower = this.base.firepower
  public readonly torpedo = this.base.torpedo
  public readonly antiAir = this.base.antiAir
  public readonly bombing = this.base.bombing
  public readonly asw = this.base.asw
  public readonly accuracy = this.base.accuracy
  public readonly evasion = this.base.evasion
  public readonly antiBomber = this.base.antiBomber
  public readonly interception = this.base.interception
  public readonly los = this.base.los
  public readonly armor = this.base.armor

  public readonly range = this.base.range
  public readonly radius = this.base.radius
  public readonly cost = this.base.cost
  public readonly improvable = this.base.improvable

  public readonly luck = this.base.luck
  public readonly maxHp = this.base.maxHp
  public readonly speed = this.base.speed

  constructor(
    public state: GearState,
    private base: GearBase,
    public readonly improvementBonuses: ImprovementBonuses,
    private proficiency: Proficiency
  ) {}

  get hasProficiency() {
    return this.in("Seaplane", "CbAircraft", "LbAircraft", "JetAircraft")
  }

  get ace() {
    return this.proficiency.ace
  }

  public calcFighterPower = (slotSize: number) => {
    const { antiAir, interception, improvementBonuses, proficiency } = this
    const multiplier = antiAir + 1.5 * interception + improvementBonuses.fighterPower
    return Math.floor(multiplier * Math.sqrt(slotSize) + proficiency.fighterPowerModifier)
  }

  public calcInterceptionPower = (slotSize: number) => {
    const { antiAir, interception, antiBomber, improvementBonuses, proficiency } = this
    const multiplier = antiAir + interception + 2 * antiBomber + improvementBonuses.fighterPower
    return Math.floor(multiplier * Math.sqrt(slotSize) + proficiency.fighterPowerModifier)
  }

  public calcContactTriggerFactor = (slotSize: number) => {
    if (!this.is("Recon")) return 0
    return Math.floor(this.los * Math.sqrt(slotSize))
  }

  private get isContactSelectionPlane() {
    return this.is("Recon") || this.categoryIn("CbTorpedoBomber")
  }

  public calcContactSelectionChance = (airStateModifier: number) => {
    if (!this.isContactSelectionPlane) return 0

    const { los, improvementBonuses } = this
    const value = Math.ceil(los + improvementBonuses.contactSelection) / (20 - 2 * airStateModifier)
    return Math.min(value, 1)
  }

  get adjustedAntiAir() {
    const { antiAir, improvementBonuses, is, categoryIn } = this
    if (antiAir === 0) {
      return 0
    }

    let multiplier = 0
    if (categoryIn("AntiAirGun")) {
      multiplier = 6
    } else if (categoryIn("AntiAirFireDirector") || is("HighAngleMount")) {
      multiplier = 4
    } else if (is("Radar")) {
      multiplier = 3
    }
    return multiplier * antiAir + improvementBonuses.adjustedAntiAir
  }

  get fleetAntiAir() {
    const { name, antiAir, improvementBonuses, is, categoryIn } = this

    if (antiAir === 0) return 0

    let multiplier: number
    if (categoryIn("AntiAirFireDirector") || is("HighAngleMount")) {
      multiplier = 0.35
    } else if (categoryIn("AntiAirShell")) {
      multiplier = 0.6
    } else if (is("Radar")) {
      multiplier = 0.4
    } else if (name === "46cm三連装砲") {
      multiplier = 0.25
    } else {
      multiplier = 0.2
    }

    return multiplier * antiAir + improvementBonuses.fleetAntiAir
  }
}
