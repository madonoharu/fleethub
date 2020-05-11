import { GearId, ShipClass, ShipType, ShipId, ShipRuby } from "@fleethub/data"
import { createEquipmentBonuses as createBasicBonuses } from "equipment-bonus"

import { Equipment, EquipmentKey } from "../equipment"

import { ShipIdentityWithSpeed, EquipmentBonuses } from "./types"
import { GearBase } from "../gear"
import { mapValues } from "../utils"

export enum SpeedValue {
  Slow = 5,
  Fast = 10,
  FastPlus = 15,
  Fastest = 20,
}

/**
 * 潜在艦速区分
 */
export enum SpeedGroup {
  FastA,
  FastB1SlowA,
  FastB2SlowB,
  OtherC,
}

export const getSpeedGroup = (ship: ShipIdentityWithSpeed): SpeedGroup => {
  const { shipId, shipType, shipClass, speed } = ship
  const isFastAV = speed === SpeedValue.Fast && shipType === ShipType.AV

  if (
    isFastAV ||
    [ShipType.SS, ShipType.SSV].includes(shipType) ||
    [ShipId["夕張"], ShipId["夕張改"]].includes(shipId) ||
    [ShipClass.KagaClass, ShipClass.AkatsukiClass, ShipClass.RepairShip, ShipClass.RevisedKazahayaClass].includes(
      shipClass
    )
  ) {
    return SpeedGroup.OtherC
  }

  if (
    [
      ShipClass.ShimakazeClass,
      ShipClass.TashkentClass,
      ShipClass.TaihouClass,
      ShipClass.ShoukakuClass,
      ShipClass.ToneClass,
      ShipClass.MogamiClass,
    ].includes(shipClass)
  ) {
    return SpeedGroup.FastA
  }

  if (
    [
      ShipClass.AganoClass,
      ShipClass.SouryuuClass,
      ShipClass.HiryuuClass,
      ShipClass.KongouClass,
      ShipClass.YamatoClass,
      ShipClass.IowaClass,
    ].includes(shipClass)
  ) {
    return SpeedGroup.FastB1SlowA
  }

  const ruby = ship.ruby as ShipRuby
  const isAmatsukaze = ruby === "あまつかぜ"
  const isUnryuu = ruby === "うんりゅう"
  const isAmagi = ruby === "あまぎ"
  const isNagatoKai2 = shipId === ShipId["長門改二"]

  if (isAmatsukaze || isUnryuu || isAmagi || isNagatoKai2) {
    return SpeedGroup.FastB1SlowA
  }

  return SpeedGroup.FastB2SlowB
}

export type SpeedBonusParams = {
  speedGroup: SpeedGroup
  hasTurbine: boolean
  enhancedBoilerCount: number
  newModelBoilerCount: number
  hasSpecialBonus: boolean
}

export const calcSpeedBonus = ({
  speedGroup,
  hasTurbine,
  enhancedBoilerCount,
  newModelBoilerCount,
  hasSpecialBonus,
}: SpeedBonusParams) => {
  if (!hasTurbine) return 0

  const totalBoilerCount = enhancedBoilerCount + newModelBoilerCount

  if (speedGroup === SpeedGroup.FastA) {
    if (newModelBoilerCount >= 1 || totalBoilerCount >= 2) return 10
  }

  if (speedGroup === SpeedGroup.FastB1SlowA && newModelBoilerCount >= 1) {
    if (totalBoilerCount >= 3) return 15
    if (totalBoilerCount >= 2) return 10
  }

  if (speedGroup === SpeedGroup.FastB2SlowB) {
    if (newModelBoilerCount >= 2 || totalBoilerCount >= 3) return 10
  }

  if (hasSpecialBonus) {
    return 5
  }

  if (totalBoilerCount >= 1) {
    return 5
  }

  return 0
}

const createEffectiveLosBonus = (ship: ShipIdentityWithSpeed, gears: GearBase[]) => {
  const filtered = gears.filter((gear) => !gear.is("Radar"))
  return createBasicBonuses(ship, filtered).los
}

export const createEquipmentBonuses = (ship: ShipIdentityWithSpeed, gears: GearBase[]): EquipmentBonuses => {
  const bonuses = createBasicBonuses(ship, gears)

  const speed = calcSpeedBonus({
    speedGroup: getSpeedGroup(ship),
    hasTurbine: gears.some((gear) => gear.gearId === GearId["改良型艦本式タービン"]),
    enhancedBoilerCount: gears.filter((gear) => gear.gearId === GearId["強化型艦本式缶"]).length,
    newModelBoilerCount: gears.filter((gear) => gear.gearId === GearId["新型高温高圧缶"]).length,
    hasSpecialBonus: ship.shipClass === ShipClass.JohnCButlerClass || ship.shipId === ShipId["夕張改二特"],
  })

  const effectiveLos = createEffectiveLosBonus(ship, gears)

  return { ...bonuses, speed, effectiveLos }
}

const subtract = (left: EquipmentBonuses, right: EquipmentBonuses): EquipmentBonuses =>
  mapValues(left, (value, key) => value - right[key])

export const createShipEquipmentBonuses = (ship: ShipIdentityWithSpeed, equipment: Equipment) => {
  const bonuses = createEquipmentBonuses(ship, equipment.gears)

  const createNextBonusesGetter = (excludedKey: EquipmentKey) => {
    const filtered = equipment.filter((gear, key) => key !== excludedKey)
    const current = createEquipmentBonuses(ship, filtered)

    return (gear: GearBase) => {
      const next = createEquipmentBonuses(ship, [...filtered, gear])
      return subtract(next, current)
    }
  }

  return { bonuses, createNextBonusesGetter }
}
