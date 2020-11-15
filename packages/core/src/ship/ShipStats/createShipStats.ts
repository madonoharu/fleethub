import { Equipment } from "../../equipment"
import { ShipBaseStats, ShipStatsState, BasicStatKey, EquipmentBonuses } from "../types"

import { ShipBasicStat, ShipBasicStatWithLevel } from "./ShipBasicStat"
import { ShipMaxHp } from "./ShipMaxHp"
import { ShipSpeed } from "./ShipSpeed"
import { ShipRange } from "./ShipRange"
import { ShipLuck } from "./ShipLuck"
import { ShipHealth } from "./ShipHealth"
import { ShipMorale } from "./ShipMorale"
import { ShipAmmo } from "./ShipAmmo"
import { ShipFuel } from "./ShipFuel"
import { ShipAccuracy } from "./ShipAccuracy"

export const createShipStats = (
  base: ShipBaseStats,
  state: ShipStatsState,
  equipment: Equipment,
  bonuses: EquipmentBonuses
) => {
  const { level = 99 } = state
  const isMarried = level >= 100
  const maxHp = new ShipMaxHp(base.maxHp, state.maxHp, isMarried)

  const createBasicStat = (key: BasicStatKey) => {
    const args = [base[key], equipment.sumBy(key), state[key], bonuses[key]] as const

    if (["asw", "los", "evasion"].includes(key)) {
      return new ShipBasicStatWithLevel(level, ...args)
    }

    return new ShipBasicStat(...args)
  }

  return {
    level,

    firepower: createBasicStat("firepower"),
    armor: createBasicStat("armor"),
    torpedo: createBasicStat("torpedo"),
    antiAir: createBasicStat("antiAir"),
    asw: createBasicStat("asw"),
    los: createBasicStat("los"),
    evasion: createBasicStat("evasion"),

    maxHp,
    speed: new ShipSpeed(base.speed, bonuses.speed),
    range: new ShipRange(base.range, equipment.maxValueBy("range"), bonuses.range),
    luck: new ShipLuck(base.luck, state.luck),
    accuracy: new ShipAccuracy(equipment.sumBy("accuracy"), bonuses.accuracy),

    health: new ShipHealth(maxHp.value, state.currentHp),
    morale: new ShipMorale(state.morale),
    ammo: new ShipAmmo(base.ammo, state.ammo),
    fuel: new ShipFuel(base.fuel, state.fuel),
  }
}
