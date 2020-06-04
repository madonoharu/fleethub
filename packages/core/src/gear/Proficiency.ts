import { Proficiency } from "./types"

export type ProficiencyType = "Fighter" | "SeaplaneBomber" | "Other"

const expTable = [0, 10, 25, 40, 55, 70, 85, 100]

type LevelBonus = { level: number; value: number }

const getLevelBonus = (bonuses: LevelBonus[], level: number) => {
  if (bonuses.length === 0) return 0

  return Math.max(...bonuses.filter((bonus) => bonus.level <= level).map((bonus) => bonus.value))
}

const fighterPowerLevelBonusTable = {
  Fighter: [
    { level: 7, value: 22 },
    { level: 5, value: 14 },
    { level: 4, value: 9 },
    { level: 3, value: 5 },
    { level: 2, value: 2 },
    { level: 0, value: 0 },
  ],
  SeaplaneBomber: [
    { level: 7, value: 6 },
    { level: 5, value: 3 },
    { level: 2, value: 1 },
    { level: 0, value: 0 },
  ],
  Other: [],
}

/** 熟練度 */
export class ProficiencyImpl implements Proficiency {
  public static readonly fighterPowerLevelBonuses = {
    Fighter: [
      { level: 7, value: 22 },
      { level: 5, value: 14 },
      { level: 4, value: 9 },
      { level: 3, value: 5 },
      { level: 2, value: 2 },
      { level: 0, value: 0 },
    ],
    SeaplaneBomber: [
      { level: 7, value: 6 },
      { level: 5, value: 3 },
      { level: 2, value: 1 },
      { level: 0, value: 0 },
    ],
    Other: [],
  }

  public static expTable = expTable

  public static maxExp = 120

  public static expToAce = (exp: number) => {
    return expTable.filter((boundary) => boundary <= exp).length - 1
  }

  constructor(private exp: number, private type: ProficiencyType) {}

  get ace() {
    return ProficiencyImpl.expToAce(this.exp)
  }

  get fighterPowerModifier() {
    const { exp, ace, type } = this
    if (exp <= 0) {
      return 0
    }

    const table = fighterPowerLevelBonusTable[type]
    const levelBonus = getLevelBonus(table, ace)

    return levelBonus + Math.sqrt(exp / 10)
  }
}
