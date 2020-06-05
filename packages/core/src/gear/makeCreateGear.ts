import { GearState, GearImpl } from "./GearImpl"
import MasterGear from "./MasterGear"
import { ProficiencyImpl, ProficiencyType } from "./ProficiencyImpl"

export const makeCreateGear = (getBase: (gearId: number) => MasterGear | undefined) => (state: GearState) => {
  const { gearId, stars = 0, exp = 0 } = state
  const base = getBase(gearId)
  if (!base) return

  const improvement = base.toImprovementBonuses(stars)

  let proficiencyType: ProficiencyType = "Other"
  if (base.is("Fighter")) {
    proficiencyType = "Fighter"
  } else if (base.categoryIs("SeaplaneBomber")) {
    proficiencyType = "SeaplaneBomber"
  }

  const proficiency = new ProficiencyImpl(exp, proficiencyType)
  return new GearImpl(state, base, improvement, proficiency)
}
