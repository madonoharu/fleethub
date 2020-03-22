import { ShipBase, StatBase } from "./MasterShip"

const calcStatAtLevel = (at1: number, at99: number, level: number) => Math.floor(((at99 - at1) * level) / 99 + at1)

export type ShipStat = {
  left: number
  right: number

  equipment: number
  modernization: number
  bonus: number

  naked: number
  value: number
}

const getMarriageBonus = (left: number) => {
  if (left >= 90) return 9
  if (left >= 70) return 8
  if (left >= 50) return 7
  if (left >= 40) return 6
  if (left >= 30) return 5
  return 4
}

export class BasicStat implements ShipStat {
  constructor(
    public left: number,
    public right: number,
    public equipment: number,
    public modernization = 0,
    public bonus = 0
  ) {}

  get naked() {
    const { right, modernization } = this
    return right + modernization
  }

  get value() {
    const { naked, equipment, bonus } = this
    return naked + equipment + bonus
  }
}

export class IncreasingStat implements ShipStat {
  constructor(
    public left: number,
    public right: number,
    public equipment: number,
    public modernization = 0,
    public bonus = 0,
    private level: number
  ) {}

  get naked() {
    const { left, right, level, modernization } = this
    return calcStatAtLevel(left, right, level) + modernization
  }

  get value() {
    const { naked, equipment, bonus } = this
    return naked + equipment + bonus
  }
}

export class ShipMaxHp {
  constructor(public left: number, public right: number, public modernization = 0, private isMarried: boolean) {}

  get value() {
    const { left, right, modernization, isMarried } = this
    let value = left + modernization

    if (isMarried) {
      value += getMarriageBonus(left)
    }

    return Math.min(value, right)
  }
}

export class ShipLuck {
  constructor(public left: number, public right: number, public modernization = 0) {}

  get value() {
    const { left, modernization } = this
    return left + modernization
  }
}

type BasicStatKey = "firepower" | "torpedo" | "antiAir" | "armor"
type IncreasingStatKey = "asw" | "los" | "evasion"

export type ShipStats = Record<BasicStatKey | IncreasingStatKey, ShipStat> & {
  maxHp: ShipMaxHp
  luck: ShipLuck
}

export type ModernizationRecord = Partial<Record<BasicStatKey | IncreasingStatKey | "maxHp" | "luck", number>>

type ShipStatsRecord = Partial<Record<BasicStatKey | IncreasingStatKey | "hp" | "luck", number>>

type Equipment = {
  sumBy: (key: BasicStatKey | IncreasingStatKey) => number
}

export const createShipStats = (
  level: number,
  base: Pick<ShipBase, keyof ShipStatsRecord>,
  equipment: Equipment,
  modernization: ModernizationRecord,
  bonus: ShipStatsRecord
): ShipStats => {
  const createBasicStat = (key: BasicStatKey) => {
    return new BasicStat(base[key][0], base[key][1], equipment.sumBy(key), modernization[key], bonus[key])
  }

  const createIncreasingStat = (key: IncreasingStatKey) => {
    return new IncreasingStat(base[key][0], base[key][1], equipment.sumBy(key), modernization[key], bonus[key], level)
  }

  const isMarried = level >= 100

  return {
    firepower: createBasicStat("firepower"),
    armor: createBasicStat("armor"),
    torpedo: createBasicStat("torpedo"),
    antiAir: createBasicStat("antiAir"),

    asw: createIncreasingStat("asw"),
    los: createIncreasingStat("los"),
    evasion: createIncreasingStat("evasion"),

    maxHp: new ShipMaxHp(base.hp[0], base.hp[1], modernization.maxHp, isMarried),
    luck: new ShipLuck(base.luck[0], base.luck[1], modernization.luck)
  }
}
