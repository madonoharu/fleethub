import { MasterGear } from "../MasterDataAdapter"

import { ProficiencyImpl, ProficiencyType } from "./ProficiencyImpl"
import { GearImpl } from "./GearImpl"
import { GearState } from "./types"

export const makeCreateGear = (getMaster: (gearId: number) => MasterGear | undefined) => (state: GearState) => {
  const { gearId, stars = 0, exp = 0 } = state
  const master = getMaster(gearId)
  if (!master) return

  const improvementBonuses = master.getImprovementBonuses(stars)

  let proficiencyType: ProficiencyType = "Other"
  if (master.is("Fighter")) {
    proficiencyType = "Fighter"
  } else if (master.categoryIs("SeaplaneBomber")) {
    proficiencyType = "SeaplaneBomber"
  }

  const proficiency = new ProficiencyImpl(exp, proficiencyType)
  return new GearImpl(state, master, improvementBonuses, proficiency)
}
