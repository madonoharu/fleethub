import { GearId, NumberRecord } from "@fleethub/utils"

import { AirState, DayCutin, DayCutinType } from "../common"
import { getDayCutin } from "../FhDefinitions"

import { ShellingAbility, Ship } from "./types"

const getPossibleDayCutinTypes = (ship: Ship): DayCutinType[] => {
  const { equipment } = ship
  const types: DayCutinType[] = ["Normal"]

  if (ship.isCarrierLike) {
    const cbBomberAircraftCount = equipment.countAircraft((gear) => gear.category === "CbDiveBomber")

    if (cbBomberAircraftCount === 0 || !equipment.hasAircraft((gear) => gear.category === "CbTorpedoBomber")) {
      return types
    }

    types.push("BA")
    if (cbBomberAircraftCount >= 2) types.push("BBA")
    if (equipment.hasAircraft((gear) => gear.category === "CbFighter")) types.push("FBA")

    return types
  }

  const mainGunCount = equipment.count((gear) => gear.is("MainGun"))
  if (!mainGunCount) return types

  if (ship.shipClass === "IseClass" && ship.is("Kai2")) {
    const zuiunAircraftCount = equipment.countAircraft(({ gearId }) =>
      [
        GearId["瑞雲"],
        GearId["瑞雲(六三一空)"],
        GearId["瑞雲(六三四空)"],
        GearId["瑞雲(六三四空/熟練)"],
        GearId["瑞雲12型"],
        GearId["瑞雲12型(六三四空)"],
        GearId["瑞雲改二(六三四空)"],
        GearId["瑞雲改二(六三四空/熟練)"],
      ].includes(gearId)
    )

    const suisei634AircraftCount = equipment.countAircraft(({ gearId }) =>
      [
        GearId["彗星一二型(六三四空/三号爆弾搭載機)"],
        GearId["彗星二二型(六三四空)"],
        GearId["彗星二二型(六三四空/熟練)"],
      ].includes(gearId)
    )

    if (zuiunAircraftCount >= 2) types.push("Zuiun")
    if (suisei634AircraftCount >= 2) types.push("Suisei")
  }

  const secondaryGunCount = equipment.count((gear) => gear.categoryIs("SecondaryGun"))
  const hasApShell = equipment.has((gear) => gear.categoryIs("ApShell"))
  const hasRader = equipment.has((gear) => gear.is("Radar"))

  if (mainGunCount >= 2) {
    types.push("DoubleAttack")

    if (hasApShell) types.push("MainMain")
  }

  if (secondaryGunCount >= 1) {
    types.push("MainSecond")

    if (hasRader) types.push("MainRader")
    if (hasApShell) types.push("MainApShell")
  }

  return types
}

const calcObservationTerm = (ship: Ship, fleetLosModifier: number, airState: AirState, isMainFlagship: boolean) => {
  const luck = ship.luck.value
  const equipmentLos = ship.los.equipment

  const luckFactor = Math.floor(Math.sqrt(luck) + 10)
  const flagshipModifier = isMainFlagship ? 15 : 0

  if (airState === "AirSupremacy") {
    return Math.floor(luckFactor + 0.7 * (fleetLosModifier + 1.6 * equipmentLos) + 10) + flagshipModifier
  }
  if (airState === "AirSuperiority") {
    return Math.floor(luckFactor + 0.6 * (fleetLosModifier + 1.2 * equipmentLos)) + flagshipModifier
  }

  return 0
}

export const calcShellingAbility = (
  ship: Ship,
  fleetLosModifier: number,
  airState: AirState,
  isMainFlagship: boolean
): ShellingAbility => {
  const observationTerm = calcObservationTerm(ship, fleetLosModifier, airState, isMainFlagship)
  const types = getPossibleDayCutinTypes(ship)
  const cutins = types.map(getDayCutin).sort((a, b) => a.priority - b.priority)

  const rates = new NumberRecord<DayCutin>().withMut((rates) => {
    cutins.forEach((ci) => {
      const attackRate = Math.min(observationTerm / ci.denominator, 1)
      const actualRate = (1 - rates.sum()) * attackRate
      rates.set(ci, actualRate)
    })
  })

  const cutinRate = rates.map((rate, def) => (def.type === "Normal" ? 0 : rate)).sum()

  return { observationTerm, rates, cutinRate }
}
