import { MasterGear, ImprovementBonuses } from "../MasterDataAdapter"

import { GearState, Gear, Proficiency } from "./types"

export class GearImpl implements Gear {
  public readonly gearId = this.state.gearId
  public readonly stars = this.state.stars || 0
  public readonly exp = this.state.exp || 0

  public readonly types = this.master.types
  public readonly name = this.master.name
  public readonly category = this.master.category
  public readonly categoryName = this.master.categoryName
  public readonly categoryId = this.master.categoryId
  public readonly iconId = this.master.iconId
  public readonly specialType2 = this.master.specialType2
  public readonly attrs = this.master.attrs
  public readonly isAbyssal = this.master.isAbyssal

  public readonly categoryIs = this.master.categoryIs
  public readonly categoryIn = this.master.categoryIn
  public readonly is = this.master.is
  public readonly in = this.master.in

  public readonly firepower = this.master.firepower
  public readonly torpedo = this.master.torpedo
  public readonly antiAir = this.master.antiAir
  public readonly bombing = this.master.bombing
  public readonly asw = this.master.asw
  public readonly accuracy = this.master.accuracy
  public readonly evasion = this.master.evasion
  public readonly antiBomber = this.master.antiBomber
  public readonly interception = this.master.interception
  public readonly los = this.master.los
  public readonly armor = this.master.armor

  public readonly range = this.master.range
  public readonly radius = this.master.radius
  public readonly cost = this.master.cost
  public readonly improvable = this.master.improvable

  public readonly luck = this.master.luck
  public readonly maxHp = this.master.maxHp
  public readonly speed = this.master.speed

  public readonly getImprovementBonuses = this.master.getImprovementBonuses
  public readonly improvementBonusFormulas = this.master.improvementBonusFormulas

  constructor(
    public state: GearState,
    private master: MasterGear,
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
