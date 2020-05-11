import { DeckGear } from "../utils"
import Proficiency from "./Proficiency"
import { GearBase } from "./MasterGear"
import { ImprovementBonuses } from "./ImprovementData"

export type GearState = {
  gearId: number
  stars?: number
  exp?: number
}

export type Gear = Readonly<
  Required<GearState> &
    GearBase & {
      state: GearState

      hasProficiency: boolean
      ace: number
      deck: DeckGear

      improvement: ImprovementBonuses
    }
>

export class GearImpl implements Gear {
  public readonly gearId = this.state.gearId
  public readonly stars = this.state.stars || 0
  public readonly exp = this.state.exp || 0

  public readonly name = this.base.name
  public readonly category = this.base.category
  public readonly iconId = this.base.iconId
  public readonly attrs = this.base.attrs
  public readonly specialCategory = this.base.specialCategory

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

  constructor(public state: GearState, private base: GearBase, public readonly improvement: ImprovementBonuses) {}

  get hasProficiency() {
    return this.in("Seaplane", "CbAircraft", "LbAircraft", "JetAircraft")
  }

  get ace() {
    return Proficiency.expToLevel(this.exp)
  }

  get deck() {
    return { id: this.gearId, mas: this.ace, rf: this.stars }
  }
}
