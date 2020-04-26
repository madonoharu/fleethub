import { ShipClass, GearId, GearCategory } from "@fleethub/data"

import { Ship } from "../../ship"
import { calcAttackPower } from "../AttackPower"
import { getPossibleDaySpecialAttackTypes } from "./DaySpecialAttackType"
import { createDaySpecialAttack, calcObservationTerm } from "./DaySpecialAttack"
import RateMap from "../RateMap"
import { AirControlState } from "../../common"

const ShellingCap = 180

export type ShellingPowerParams = Partial<{
  firepower: number
  improvementBonus: number
  fleetFactor: number

  formationModifier: number
  engagementModifier: number
  healthModifier: number

  cruiserFitBonus: number
  apShellModifier: number
  specialAttackModifier: number
  isCritical: boolean
  isAntiInstallation: boolean
}>

type ShipParams = {
  firepower: number
  improvementBonus: number
  healthModifier: number
  cruiserFitBonus: number
}

const calcBasicPower = ({ firepower = 0, improvementBonus = 0, fleetFactor = 0 }: ShellingPowerParams) => {
  return 5 + firepower + improvementBonus + fleetFactor
}

export const calcShellingPower = (params: ShellingPowerParams) => {
  const {
    formationModifier = 1,
    engagementModifier = 1,
    healthModifier = 1,

    cruiserFitBonus,
    specialAttackModifier,

    apShellModifier,
  } = params

  const basic = calcBasicPower(params)

  const a14 = formationModifier * engagementModifier * healthModifier
  const b14 = cruiserFitBonus
  const a11 = specialAttackModifier

  return calcAttackPower({ basic, cap: ShellingCap, a14, b14, a11, apShellModifier })
}

type Params = {
  fleetFactor: number
}

export default class ShipShellingCalculator {
  constructor(private ship: Ship) {}

  private get isCarrierShelling() {
    const { ship } = this
    if (ship.is("AircraftCarrierClass")) {
      return true
    }

    if (ship.shipClass !== ShipClass.RevisedKazahayaClass && !ship.is("Installation")) {
      return false
    }

    return ship.equipment.hasAircraft((gear) =>
      gear.categoryIn("CbTorpedoBomber", "CbDiveBomber", "JetTorpedoBomber", "JetFighterBomber")
    )
  }

  private getPossibleDaySpecialAttackTypes() {
    const { isCarrierShelling, ship } = this
    const { equipment } = ship
    return getPossibleDaySpecialAttackTypes({
      isCarrierShelling,
      isIseClassK2: ship.shipClass === ShipClass.IseClass && ship.is("Kai2"),
      hasObservationSeaplane: equipment.hasAircraft((gear) => gear.is("ObservationSeaplane")),

      mainGunCount: equipment.count((gear) => gear.is("MainGun")),
      secondaryGunCount: equipment.count((gear) => gear.category === GearCategory.SecondaryGun),
      hasApShell: equipment.has((gear) => gear.category === GearCategory.ApShell),
      hasRader: equipment.has((gear) => gear.is("Radar")),

      zuiunAircraftCount: equipment.countAircraft(({ gearId }) =>
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
      ),
      suisei634AircraftCount: equipment.countAircraft(({ gearId }) =>
        [
          GearId["彗星一二型(六三四空/三号爆弾搭載機)"],
          GearId["彗星二二型(六三四空)"],
          GearId["彗星二二型(六三四空/熟練)"],
        ].includes(gearId)
      ),

      hasCbFighterAircraft: equipment.hasAircraft((gear) => gear.category === GearCategory.CbFighter),
      cbBomberAircraftCount: equipment.countAircraft((gear) => gear.category === GearCategory.CbDiveBomber),
      hasCbTorpedoBomberAircraft: equipment.hasAircraft((gear) => gear.category === GearCategory.CbTorpedoBomber),
    })
  }

  public calcObservationTerm = (fleetLosModifier: number, isFlagship: boolean, airControlState: AirControlState) => {
    const { ship } = this
    return calcObservationTerm({
      luck: ship.luck.displayed,
      equipmentLos: ship.los.equipment,
      isFlagship,
      fleetLosModifier,
      airControlState,
    })
  }

  public getPossibleAttacksRateMap = (observationTerm: number) => {
    const attacks = this.getPossibleDaySpecialAttackTypes().map(createDaySpecialAttack)
    const rateMap = new RateMap()

    attacks.forEach((attack) => {
      const attackRate = Math.min(observationTerm / attack.baseRate, 1)
      const effectiveRate = rateMap.complement * attackRate
      rateMap.set(attack, effectiveRate)
    })

    return rateMap
  }

  private calcAirPower() {
    const torpedo = this.ship.torpedo.displayed
    const bombing = this.ship.equipment.sumBy("bombing")
    return Math.floor(Math.floor(1.3 * bombing) + torpedo) + 15
  }

  public createPower = ({ fleetFactor }: Params) => {
    const { ship } = this
    const firepower = ship.firepower.displayed
    const improvementBonus = ship.equipment.sumBy((gear) => gear.improvement.shellingPowerBonus)

    const basic = 5 + firepower + improvementBonus + fleetFactor

    let airPower: number | undefined

    if (this.isCarrierShelling) {
      airPower = this.calcAirPower()
    }

    const healthModifier = ship.health.shellingPowerModifier

    return {
      basic,

      firepower,
      improvementBonus,
      fleetFactor,

      airPower,
    }
  }
}
