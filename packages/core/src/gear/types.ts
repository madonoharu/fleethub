import { MasterGear, ImprovementBonuses } from "../MasterDataAdapter"

export type Proficiency = {
  ace: number
  fighterPowerModifier: number
}

export type GearState = {
  gearId: number
  stars?: number
  exp?: number
}

export type GearBase = MasterGear

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
