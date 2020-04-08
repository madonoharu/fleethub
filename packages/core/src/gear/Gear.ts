import { DeckGear } from "../utils"
import Proficiency from "./Proficiency"
import { GearBase } from "./MasterGear"
import { GearAttribute } from "./GearAttribute"

export type GearState = {
  gearId: number
  stars?: number
  exp?: number
}

export type Gear = Required<GearState> &
  GearBase & {
    deck: DeckGear
  }

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

  public readonly hp = this.base.hp
  public readonly firepower = this.base.firepower
  public readonly armor = this.base.armor
  public readonly torpedo = this.base.torpedo
  public readonly antiAir = this.base.antiAir
  public readonly speed = this.base.speed
  public readonly bombing = this.base.bombing
  public readonly asw = this.base.asw
  public readonly los = this.base.los
  public readonly luck = this.base.luck
  public readonly accuracy = this.base.accuracy
  public readonly evasion = this.base.evasion
  public readonly antiBomber = this.base.antiBomber
  public readonly interception = this.base.interception
  public readonly range = this.base.range
  public readonly radius = this.base.radius
  public readonly cost = this.base.cost
  public readonly improvable = this.base.improvable

  constructor(private state: GearState, private base: GearBase) {}

  get deck() {
    const mas = Proficiency.expToLevel(this.exp)
    return { id: this.gearId, mas, rf: this.stars }
  }
}
