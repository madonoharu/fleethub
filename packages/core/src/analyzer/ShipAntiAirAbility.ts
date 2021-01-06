import { GearId } from "@fleethub/utils"

import { Ship } from "../ship"
import { BattleType, ShipRole, AntiAirCutin } from "../common"
import { getShipAntiAirCutinChance } from "./AntiAirCutinChance"

const getCombinedFleetModifier = (role: ShipRole, battleType: BattleType) => {
  if (role === "Escort") return 0.48
  if (battleType === "AirDefense") return 0.72
  return 0.8
}

export type ShipAntiAirAbilityContext = {
  isEnemy: boolean
  isCombined: boolean
  role: ShipRole
  battleType: BattleType

  fleetAntiAir: number
  antiAirCutin?: AntiAirCutin
}

export class ShipAntiAirAbility {
  public combinedFleetModifier = 1

  private isEnemy = this.context.isEnemy
  private fleetAntiAir = this.context.fleetAntiAir
  private ci? = this.context.antiAirCutin

  constructor(public ship: Ship, private context: ShipAntiAirAbilityContext) {
    const { isCombined, role, battleType } = context

    if (isCombined) {
      this.combinedFleetModifier = getCombinedFleetModifier(role, battleType)
    }
  }

  get antiAirCutinChance() {
    return getShipAntiAirCutinChance(this.ship)
  }

  get adjustedAntiAir() {
    const { antiAir, equipment } = this.ship

    const total = equipment.sumBy((gear) => gear.adjustedAntiAir)

    if (this.isEnemy) {
      return Math.floor(Math.floor(Math.sqrt(antiAir.value)) * 2 + total)
    }

    const preFloor = antiAir.naked + total

    if (equipment.count() === 0) return preFloor

    return 2 * Math.floor(preFloor / 2)
  }

  public calcProportionalShotdownRate = (adjustedAntiAirResist = 1) => {
    const { adjustedAntiAir, combinedFleetModifier } = this

    return Math.floor(adjustedAntiAir * adjustedAntiAirResist) * combinedFleetModifier * 0.5 * 0.25 * 0.02
  }

  public calcFixedShotdownNumber = (adjustedAntiAirResist = 1, fleetAntiAirResist = 1) => {
    const { adjustedAntiAir, fleetAntiAir, isEnemy, combinedFleetModifier, ci } = this
    // 敵味方補正
    const sideModifier = isEnemy ? 0.75 : 0.8

    const base = Math.floor(adjustedAntiAir * adjustedAntiAirResist) + Math.floor(fleetAntiAir * fleetAntiAirResist)

    let preFloor = base * 0.5 * 0.25 * sideModifier * combinedFleetModifier

    if (ci) {
      preFloor *= ci.fixedAirDefenseModifier
    }
    return Math.floor(preFloor)
  }

  get minimumBonus() {
    const { isEnemy, ci } = this

    if (ci) return ci.minimumBonus

    return isEnemy ? 0 : 1
  }

  public getShotdownNumber = (slotSize: number, adjustedAntiAirResist = 1, fleetAntiAirResist = 1) => {
    let value = 0

    // 割合撃墜
    if (Math.random() > 0.5) {
      const rate = this.calcProportionalShotdownRate(adjustedAntiAirResist)
      value += Math.floor(slotSize * rate)
    }

    // 固定撃墜
    if (Math.random() > 0.5) {
      const fixed = this.calcFixedShotdownNumber(adjustedAntiAirResist, fleetAntiAirResist)
      value += Math.floor(fixed)
    }

    // 最低保証
    value += this.minimumBonus

    return value
  }

  private isAviationShip() {
    const { ship } = this
    return ship.category === "AircraftCarrier" || ship.shipTypeIn("CAV", "BBV", "AV")
  }

  get antiAirPropellantBarrageChance() {
    if (!this.isAviationShip()) return 0

    const { ship, adjustedAntiAir } = this

    const count = ship.equipment.count(GearId["12cm30連装噴進砲改二"])
    if (!count) return 0

    const shipClassBonus = ship.shipClassIn("IseClass") ? 0.25 : 0
    const rate = (adjustedAntiAir + 0.9 * ship.luck.value) / 281 + (count - 1) * 0.15 + shipClassBonus
    return Math.min(rate, 1)
  }
}
