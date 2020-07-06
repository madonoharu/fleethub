import { ShipId, GearId } from "@fleethub/data"

import { fhDefinitions } from "../../FhDefinitions"
import { Ship, DamageState } from "../../ship"

import { getPossibleNightSpecialAttackTypes, NightSpecialAttackType } from "./NightSpecialAttackType"

type NightSpecialAttackDefinition = {
  priority: number
  denominator: number
  power: number
  accuracy: number
}

export type NightSpecialAttackDefinitions = Record<NightSpecialAttackType, NightSpecialAttackDefinition>

export type NightAttack = NightSpecialAttackDefinition & { type: NightSpecialAttackType }

type NightFleetState = {
  contactRank: 1 | 2 | 3
  searchlight: boolean
  starshell: boolean
}

export type NightAttackParams = {
  isFlagship: boolean
  damageState?: DamageState
  attackerState: NightFleetState
  defenderState: NightFleetState
}

export const calcNightCutinTerm = (ship: Ship, params: NightAttackParams) => {
  let value = 0

  const { level, luck } = ship
  const { isFlagship, attackerState, defenderState, damageState = ship.health.damage } = params

  if (luck.displayed < 50) {
    value = Math.floor(luck.displayed + 15 + 0.75 * Math.sqrt(level))
  } else {
    value = Math.floor(Math.sqrt(luck.displayed - 50) + 65 + 0.8 * Math.sqrt(level))
  }

  if (isFlagship) value += 15
  if (damageState === "Chuuha") value += 18
  if (ship.equipment.has(GearId["熟練見張員"])) value += 5

  if (attackerState.searchlight) value += 7
  if (defenderState.searchlight) value += -5

  if (attackerState.starshell) value += 4
  if (defenderState.starshell) value += -10

  return value
}

const isNightCarrier = (ship: Ship) => {
  if (!ship.is("AircraftCarrierClass")) return false

  // Saratoga Mk.II | 赤城改二戊 | 夜間作戦航空要員
  const hasNoap =
    [ShipId["Saratoga Mk.II"], ShipId["赤城改二戊"]].includes(ship.shipId) ||
    ship.equipment.has((gear) =>
      [GearId["夜間作戦航空要員"], GearId["夜間作戦航空要員+熟練甲板員"]].includes(gear.gearId)
    )

  if (!hasNoap) return false

  return ship.equipment.hasAircraft((gear) => gear.in("NightAttacker", "NightFighter"))
}

export const getNightAttacks = (ship: Ship) => {
  const types = getPossibleNightSpecialAttackTypes({
    shipType: ship.shipType,
    isNightCarrier: isNightCarrier(ship),
    mainGunCount: ship.equipment.count((gear) => gear.is("MainGun")),
    secondaryGunCount: ship.equipment.count((gear) => gear.categoryIn("SecondaryGun")),
    torpedoCount: ship.equipment.count((gear) => gear.categoryIn("Torpedo", "SubmarineTorpedo")),
    lateModelBowTorpedoCount: ship.equipment.count((gear) =>
      [GearId["後期型艦首魚雷(6門)"], GearId["熟練聴音員+後期型艦首魚雷(6門)"]].includes(gear.gearId)
    ),
    hasSubmarineRadar: ship.equipment.has((gear) => gear.categoryIn("SubmarineEquipment")),
    hasSurfaceRadar: ship.equipment.has((gear) => gear.is("SurfaceRadar")),
    hasLookout: ship.equipment.has((gear) => gear.gearId === GearId["熟練見張員"]),
    nightFighterCount: ship.equipment.countAircraft((gear) => gear.is("NightFighter")),
    nightAttackerCount: ship.equipment.countAircraft((gear) => gear.is("NightAttacker")),
    hasFuzeBomber: ship.equipment.hasAircraft((gear) => gear.gearId === GearId["彗星一二型(三一号光電管爆弾搭載機)"]),
    semiNightPlaneCount: ship.equipment.countAircraft((gear) => gear.is("SemiNightPlane")),
  })

  const attacks = types.map((type) => ({ type, ...fhDefinitions.nightSpecialAttacks[type] }))

  return attacks
}

const calcNightAttackChance = (attack: NightAttack, cutinTerm: number) => {
  if (attack.type === "DoubleAttack") return 109 / 110
  return Math.ceil(cutinTerm) / attack.denominator
}

const getNightAbility = (ship: Ship, params: NightAttackParams) => {
  const cutinTerm = calcNightCutinTerm(ship, params)

  const types = getPossibleNightSpecialAttackTypes({
    shipType: ship.shipType,
    isNightCarrier: isNightCarrier(ship),
    mainGunCount: ship.equipment.count((gear) => gear.is("MainGun")),
    secondaryGunCount: ship.equipment.count((gear) => gear.categoryIn("SecondaryGun")),
    torpedoCount: ship.equipment.count((gear) => gear.categoryIn("Torpedo", "SubmarineTorpedo")),
    lateModelBowTorpedoCount: ship.equipment.count((gear) =>
      [GearId["後期型艦首魚雷(6門)"], GearId["熟練聴音員+後期型艦首魚雷(6門)"]].includes(gear.gearId)
    ),
    hasSubmarineRadar: ship.equipment.has((gear) => gear.categoryIn("SubmarineEquipment")),
    hasSurfaceRadar: ship.equipment.has((gear) => gear.is("SurfaceRadar")),
    hasLookout: ship.equipment.has((gear) => gear.gearId === GearId["熟練見張員"]),
    nightFighterCount: ship.equipment.countAircraft((gear) => gear.is("NightFighter")),
    nightAttackerCount: ship.equipment.countAircraft((gear) => gear.is("NightAttacker")),
    hasFuzeBomber: ship.equipment.hasAircraft((gear) => gear.gearId === GearId["彗星一二型(三一号光電管爆弾搭載機)"]),
    semiNightPlaneCount: ship.equipment.countAircraft((gear) => gear.is("SemiNightPlane")),
  })

  const attacks = types.map((type) => {
    const
    const rate = calcNightAttackChance({ type, ...fhDefinitions.nightSpecialAttacks[type] }, cutinTerm)
    return { type, ...fhDefinitions.nightSpecialAttacks[type] }
  })

  return { cutinTerm }
}
