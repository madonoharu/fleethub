import { MasterDataGear, GearCategory, GearAttribute, ImprovementBonusType, Dict } from "@fleethub/utils"

export type ImprovementBonusFormulas = Dict<ImprovementBonusType, string>
export type ImprovementBonuses = Record<ImprovementBonusType, number>

export type Proficiency = {
  ace: number
  fighterPowerModifier: number
}

export interface GearBase extends Omit<Required<MasterDataGear>, "id"> {
  gearId: number

  categoryId: number
  iconId: number
  specialType2: number
  attrs: GearAttribute[]

  is: (attr: GearAttribute) => boolean
  in: (...attrs: GearAttribute[]) => boolean
  categoryIs: (category: GearCategory) => boolean
  categoryIn: (...categories: GearCategory[]) => boolean

  isAbyssal: boolean
  hasProficiency: boolean
}

export type GearState = {
  gearId: number
  stars?: number
  exp?: number
}

export type Gear = Readonly<
  Required<GearState> &
    GearBase & {
      state: GearState

      ace: number

      improvementBonuses: ImprovementBonuses

      calcFighterPower: (slotSize: number) => number
      calcInterceptionPower: (slotSize: number) => number
      calcContactTriggerFactor: (slotSize: number) => number
      calcContactSelectionChance: (airStateModifier: number) => number

      adjustedAntiAir: number
      fleetAntiAir: number
    }
>
