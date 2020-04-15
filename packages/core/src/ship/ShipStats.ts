import { ShipBase } from "./MasterShip"

type BasicStatKey = "firepower" | "torpedo" | "antiAir" | "armor"
type IncreasingStatKey = "asw" | "los" | "evasion"

type EquipmentRelatedStatKey = BasicStatKey | IncreasingStatKey
export type ShipStatKey = EquipmentRelatedStatKey | "maxHp" | "luck" | "range"

export type ShipStat = {
  key: ShipStatKey
  displayed: number
  left?: number
  right?: number
  modernization?: number
  equipment?: number
  bonus?: number
  naked?: number
}

type EquipmentRelatedStat = Required<ShipStat>

export class BasicStat implements EquipmentRelatedStat {
  constructor(
    public key: BasicStatKey,
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

  get displayed() {
    const { naked, equipment, bonus } = this
    return naked + equipment + bonus
  }
}

export class IncreasingStat implements EquipmentRelatedStat {
  constructor(
    public key: IncreasingStatKey,
    public left: number,
    public right: number,
    public equipment: number,
    public modernization = 0,
    public bonus = 0,
    private level: number
  ) {}

  get naked() {
    const { left: at1, right: at99, level, modernization } = this

    return Math.floor(((at99 - at1) * level) / 99 + at1) + modernization
  }

  get displayed() {
    const { naked, equipment, bonus } = this
    return naked + equipment + bonus
  }
}

const getMarriageBonus = (left: number) => {
  if (left >= 90) return 9
  if (left >= 70) return 8
  if (left >= 50) return 7
  if (left >= 40) return 6
  if (left >= 30) return 5
  return 4
}

export class ShipMaxHp implements ShipStat {
  public readonly key = "maxHp"

  constructor(public left: number, public right: number, public modernization = 0, private isMarried: boolean) {}

  get displayed() {
    const { left, right, modernization, isMarried } = this
    let displayed = left + modernization

    if (isMarried) {
      displayed += getMarriageBonus(left)
    }

    return Math.min(displayed, right)
  }
}

export class ShipLuck implements ShipStat {
  public readonly key = "luck"

  constructor(public left: number, public right: number, public modernization = 0) {}

  get displayed() {
    const { left, modernization } = this
    return left + modernization
  }
}

export class ShipRange implements ShipStat {
  public readonly key = "range"

  constructor(public naked: number, public equipment: number, public bonus = 0) {}

  get displayed() {
    const { naked, equipment, bonus } = this
    return Math.max(naked, equipment) + bonus
  }
}

export type ShipStats = Record<EquipmentRelatedStatKey, EquipmentRelatedStat> & {
  level: number
  maxHp: ShipStat
  range: ShipStat
  luck: ShipStat
}

export type ModernizationRecord = Partial<Record<EquipmentRelatedStatKey | "maxHp" | "luck", number>>

type StatBonusRecord = Partial<Record<EquipmentRelatedStatKey | "luck" | "range", number>>

type Equipment = {
  sumBy: (key: EquipmentRelatedStatKey) => number
  maxValueBy: (key: "range") => number
}

export const createShipStats = (
  level: number,
  base: Pick<ShipBase, EquipmentRelatedStatKey | "hp" | "luck" | "range">,
  equipment: Equipment,
  modernization: ModernizationRecord,
  bonuses: StatBonusRecord
): ShipStats => {
  const createBasicStat = (key: BasicStatKey) => {
    return new BasicStat(key, base[key][0], base[key][1], equipment.sumBy(key), modernization[key], bonuses[key])
  }

  const createIncreasingStat = (key: IncreasingStatKey) => {
    return new IncreasingStat(
      key,
      base[key][0],
      base[key][1],
      equipment.sumBy(key),
      modernization[key],
      bonuses[key],
      level
    )
  }

  const isMarried = level >= 100

  return {
    level,

    firepower: createBasicStat("firepower"),
    armor: createBasicStat("armor"),
    torpedo: createBasicStat("torpedo"),
    antiAir: createBasicStat("antiAir"),

    asw: createIncreasingStat("asw"),
    los: createIncreasingStat("los"),
    evasion: createIncreasingStat("evasion"),

    maxHp: new ShipMaxHp(base.hp[0], base.hp[1], modernization.maxHp, isMarried),
    range: new ShipRange(base.range, equipment.maxValueBy("range"), bonuses.range),
    luck: new ShipLuck(base.luck[0], base.luck[1], modernization.luck),
  }
}
