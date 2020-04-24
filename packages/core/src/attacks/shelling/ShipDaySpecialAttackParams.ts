import { ShipClass, GearCategory, GearId } from "@fleethub/data"

import { Ship } from "../../ship"

import { DaySpecialAttackParams } from "./DaySpecialAttackType"

export class ShipDaySpecialAttackParams implements DaySpecialAttackParams {
  constructor(private ship: Ship, public isAntiInstallation: boolean) {}

  private has = this.ship.equipment.has
  private count = this.ship.equipment.count
  private hasAircraft = this.ship.equipment.hasAircraft
  private countAircraft = this.ship.equipment.countAircraft

  private get equipment() {
    return this.ship.equipment
  }

  get isTaiha() {
    return false
  }
  get isIseClassK2() {
    const { ship } = this
    return ship.shipClass === ShipClass.IseClass && ship.is("Kai2")
  }
  get isCarrierShelling() {
    return this.ship.is("AircraftCarrierClass")
  }
  get hasObservationSeaplane() {
    return this.hasAircraft((gear) => gear.categoryIn("ReconSeaplane", "SeaplaneBomber"))
  }

  get mainGunCount() {
    return this.count((gear) => gear.is("MainGun"))
  }
  get hasAPShell() {
    return this.has((gear) => gear.category === GearCategory.ArmorPiercingShell)
  }
  get secondaryGunCount() {
    return this.count((gear) => gear.category === GearCategory.SecondaryGun)
  }
  get hasRader() {
    return this.has((gear) => gear.is("Radar"))
  }

  get bomberCount() {
    return this.equipment.countAircraft((gear) => gear.categoryIn("CarrierBasedDiveBomber"))
  }
  get hasTorpedoBomber() {
    return this.equipment.hasAircraft((gear) => gear.categoryIn("CarrierBasedTorpedoBomber"))
  }
  get hasFighter() {
    return this.equipment.hasAircraft((gear) => gear.categoryIn("CarrierBasedFighter"))
  }

  get zuiunCount() {
    return this.countAircraft(({ gearId }) =>
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
  }
  get suisei634Count() {
    return this.countAircraft(({ gearId }) =>
      [
        GearId["彗星一二型(六三四空/三号爆弾搭載機)"],
        GearId["彗星二二型(六三四空)"],
        GearId["彗星二二型(六三四空/熟練)"],
      ].includes(gearId)
    )
  }
}
