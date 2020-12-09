import { GearId, ShipId } from "@fleethub/utils"

import { MasterShip } from "../MasterDataAdapter"

import { ShipStats, Ship } from "./types"
import { calcShellingAbility } from "./shelling"

let count = 0

export class ShipImpl implements Ship {
  public readonly id = this.state.id || `${count++}`
  public readonly shipId = this.master.shipId
  public readonly sortId = this.master.sortId
  public readonly stype = this.master.stype
  public readonly ctype = this.master.ctype
  public readonly shipType = this.master.shipType
  public readonly shipTypeName = this.master.shipTypeName
  public readonly shipClass = this.master.shipClass
  public readonly shipClassName = this.master.shipClassName
  public readonly name = this.master.name
  public readonly yomi = this.master.yomi

  public readonly attrs = this.master.attrs
  public readonly rank = this.master.rank
  public readonly category = this.master.category
  public readonly banner = this.master.banner
  public readonly convertible = this.master.convertible
  public readonly speedGroup = this.master.speedGroup
  public readonly isAbyssal = this.master.isAbyssal
  public readonly isCommonly = this.master.isCommonly

  public readonly level = this.stats.level

  public readonly firepower = this.stats.firepower
  public readonly torpedo = this.stats.torpedo
  public readonly antiAir = this.stats.antiAir
  public readonly armor = this.stats.armor
  public readonly asw = this.stats.asw
  public readonly los = this.stats.los
  public readonly evasion = this.stats.evasion

  public readonly maxHp = this.stats.maxHp
  public readonly speed = this.stats.speed
  public readonly range = this.stats.range
  public readonly luck = this.stats.luck
  public readonly accuracy = this.stats.accuracy

  public readonly health = this.stats.health
  public readonly morale = this.stats.morale
  public readonly ammo = this.stats.ammo
  public readonly fuel = this.stats.fuel

  public readonly is = this.master.is
  public readonly canEquip = this.master.canEquip
  public readonly shipClassIn = this.master.shipClassIn
  public readonly shipTypeIn = this.master.shipTypeIn

  constructor(
    public state: Ship["state"],
    private master: MasterShip,
    private stats: ShipStats,
    public equipment: Ship["equipment"],
    public makeGetNextBonuses: Ship["makeGetNextBonuses"]
  ) {}

  get fleetLosFactor() {
    const observationSeaplaneModifier = this.equipment.sumBy((gear, i, slotSize) => {
      if (slotSize && gear.is("ObservationSeaplane")) {
        return gear.los * Math.floor(Math.sqrt(slotSize))
      }
      return 0
    })

    return this.los.naked + observationSeaplaneModifier
  }

  get cruiserFitBonus() {
    const { shipClass, category, equipment } = this
    if (category === "LightCruiser") {
      const singleGunCount = equipment.count(({ gearId }) =>
        [GearId["14cm単装砲"], GearId["15.2cm単装砲"]].includes(gearId)
      )
      const twinGunCount = equipment.count(({ gearId }) =>
        [GearId["15.2cm連装砲"], GearId["14cm連装砲"], GearId["15.2cm連装砲改"]].includes(gearId)
      )
      return Math.sqrt(singleGunCount) + 2 * Math.sqrt(twinGunCount)
    }

    if (shipClass === "ZaraClass") {
      return Math.sqrt(equipment.count((gear) => gear.gearId === GearId["203mm/53 連装砲"]))
    }

    return 0
  }

  get isCarrierLike() {
    const { is, shipId, category, equipment } = this
    if (category === "AircraftCarrier") {
      return true
    }

    if (shipId !== ShipId["速吸改"] && !is("Installation")) {
      return false
    }

    return equipment.has((gear) =>
      gear.categoryIn("CbDiveBomber", "CbTorpedoBomber", "JetFighterBomber", "JetTorpedoBomber")
    )
  }

  public calcAirPower = (isAntiInstallation = false) => {
    let equipmentTorpedo: number
    let bombing: number

    if (isAntiInstallation) {
      equipmentTorpedo = 0
      bombing = this.equipment.sumBy((gear) => (gear.is("AntiInstallationCbBomber") ? gear.bombing : 0))
    } else {
      equipmentTorpedo = this.torpedo.equipment
      bombing = this.equipment.sumBy("bombing")
    }

    return Math.floor(Math.floor(1.3 * bombing) + equipmentTorpedo) + 15
  }

  get fleetAntiAir() {
    return Math.floor(this.equipment.sumBy((gear) => gear.fleetAntiAir))
  }

  get apShellModifiers() {
    const { equipment } = this

    const hasMainGun = equipment.has((gear) => gear.is("MainGun"))
    const hasApShell = equipment.has((gear) => gear.categoryIs("ApShell"))
    const hasRader = equipment.has((gear) => gear.is("Radar"))
    const hasSecondaryGun = equipment.has((gear) => gear.categoryIs("SecondaryGun"))

    if (!hasApShell || !hasMainGun) {
      return { power: 1, accuracy: 1 }
    }

    if (hasSecondaryGun && hasRader) {
      return { power: 1.15, accuracy: 1.3 }
    }
    if (hasSecondaryGun) {
      return { power: 1.15, accuracy: 1.2 }
    }
    if (hasRader) {
      return { power: 1.1, accuracy: 1.25 }
    }
    return { power: 1.08, accuracy: 1.1 }
  }

  get basicAccuracyTerm() {
    const { level, luck } = this
    return 2 * Math.sqrt(level) + 1.5 * Math.sqrt(luck.value)
  }

  get basicEvasionTerm() {
    const { evasion, luck } = this
    return evasion.value + Math.sqrt(2 * luck.value)
  }

  public calcShellingAbility: Ship["calcShellingAbility"] = (fleetLosModifier, airState, isMainFlagship) => {
    return calcShellingAbility(this, fleetLosModifier, airState, isMainFlagship)
  }

  public calcEvasionAbility: Ship["calcEvasionAbility"] = (formationModifier, postcapModifier = 0) => {
    const precap = Math.floor(this.basicEvasionTerm * formationModifier)

    const totalStars = this.equipment.sumBy((gear) => {
      if (gear.category === "EngineImprovement") return gear.stars
      return 0
    })

    const improvementBonus = Math.floor(1.5 * Math.sqrt(totalStars))

    let capped = precap
    if (precap >= 65) {
      capped = Math.floor(55 + 2 * Math.sqrt(precap - 65))
    } else if (precap >= 40) {
      capped = Math.floor(40 + 3 * Math.sqrt(precap - 40))
    }

    const evasionTerm = Math.floor(capped + postcapModifier) + improvementBonus

    return { precap, improvementBonus, formationModifier, postcapModifier, evasionTerm }
  }
}
