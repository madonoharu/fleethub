import { GearData, GearCategoryKey } from "@fleethub/data"

import { GearAttribute } from "./GearAttribute"

type FormulaType = "Sqrt" | "Linear"

export type ImprovementBonusFormula = { multiplier: number; type: FormulaType }

export type ImprovementData = Record<keyof ImprovementBonuses, ImprovementBonusFormula | undefined>

export type ImprovementBonuses = {
  contactSelectionBonus: number

  fighterPowerBonus: number
  adjustedAntiAirBonus: number
  fleetAntiAirBonus: number

  shellingPowerBonus: number
  shellingAccuracyBonus: number

  aswPowerBonus: number
  aswAccuracyBonus: number

  torpedoPowerBonus: number
  torpedoAccuracyBonus: number
  torpedoEvasionBonus: number

  nightPowerBonus: number
  nightAccuracyBonus: number

  defensePowerBonus: number

  effectiveLosBonus: number
}

export type Proficiency = {
  ace: number
  fighterPowerModifier: number
}

export interface GearBase extends Omit<Required<GearData>, "id"> {
  attrs: GearAttribute[]
  specialCategory: number

  gearId: number

  is: (attr: GearAttribute) => boolean
  in: (...attrs: GearAttribute[]) => boolean
  categoryIn: (...categories: GearCategoryKey[]) => boolean
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

      hasProficiency: boolean
      ace: number

      improvement: ImprovementBonuses

      calcFighterPower: (slotSize: number) => number
      calcInterceptionPower: (slotSize: number) => number
    }
>
