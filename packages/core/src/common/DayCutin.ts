import { SpecialAttackModifiers } from "./types"

export const dayCutins = [
  { type: "Normal", name: "単発", priority: Infinity, denominator: 0, power: 1, accuracy: 1 },

  { type: "Zuiun", name: "瑞雲", priority: 1, denominator: 130, power: 1.35, accuracy: 1 },
  { type: "Suisei", name: "海空", priority: 2, denominator: 130, power: 1.3, accuracy: 1 },

  { type: "MainMain", name: "主主", priority: 3, denominator: 150, power: 1.5, accuracy: 1.2 },
  { type: "MainApShell", name: "主徹", priority: 4, denominator: 140, power: 1.3, accuracy: 1.3 },
  { type: "MainRader", name: "主電", priority: 5, denominator: 130, power: 1.2, accuracy: 1.5 },
  { type: "MainSecond", name: "主副", priority: 6, denominator: 120, power: 1.1, accuracy: 1.3 },
  { type: "DoubleAttack", name: "連撃", priority: 7, denominator: 130, power: 1.2, accuracy: 1.1 },

  /** @see https://docs.google.com/spreadsheets/d/1i5jTixnOVjqrwZvF_4Uqf3L9ObHhS7dFqG8KiE5awkY */
  { type: "FBA", name: "FBA", priority: 1, denominator: 125, power: 1.25, accuracy: 1 },
  { type: "BBA", name: "BBA", priority: 2, denominator: 140, power: 1.2, accuracy: 1 },
  { type: "BA", name: "BA", priority: 3, denominator: 155, power: 1.15, accuracy: 1 },
] as const

export type DayCutinType = typeof dayCutins[number]["type"]

export type DayCutin = SpecialAttackModifiers & {
  type: DayCutinType
  name: string
  priority: number
  denominator: number
}
