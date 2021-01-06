import {
  mapValues,
  MasterData,
  GearCategory,
  GearAttribute,
  ShipType,
  ShipClass,
  ShipAttribute,
  MasterDataShip,
  MasterDataGear,
} from "@fleethub/utils"

import MasterShipImpl, { MasterShipEquippable } from "./MasterShipImpl"
import MasterGearImpl, { MasterGear } from "./MasterGearImpl"

export default class MasterDataAdapter {
  public gears: MasterGearImpl[]
  public ships: MasterShipImpl[]

  constructor(public masterData: MasterData) {
    this.gears = masterData.gears.map(this.createMasterGear)
    this.ships = masterData.ships.map(this.createMasterShip)
  }

  private getGearCategoryData = (type2: number) => {
    const found = this.masterData.gearCategories.find((cat) => cat.id === type2)
    return found || { id: type2, key: "Unknown", name: "不明" }
  }

  private getGearAttrs = (gearId: number) => {
    return this.masterData.gearAttrs.filter((data) => data.ids.includes(gearId)).map((data) => data.key)
  }

  private getImprovementBonusFormulas = (gearId: number) =>
    mapValues(this.masterData.improvementBonuses, (rules) => {
      return rules.find((rule) => rule.ids.includes(gearId))?.formula
    })

  private createMasterGear = (masterDataGear: MasterDataGear) => {
    const categoryData = this.getGearCategoryData(masterDataGear.types[2])
    const attrs = this.getGearAttrs(masterDataGear.id) as GearAttribute[]
    const improvementBonusFormulas = this.getImprovementBonusFormulas(masterDataGear.id)

    const additionalData = {
      category: categoryData.key as GearCategory,
      categoryName: categoryData.name,
      attrs,
      improvementBonusFormulas,
    }

    return new MasterGearImpl(masterDataGear, additionalData)
  }

  private getShipTypeData = (stype: number) => {
    const found = this.masterData.shipTypes.find((shipType) => shipType.id === stype)

    return found || { id: stype, key: "Unknown", name: "不明" }
  }

  private getShipClassData = (ctype: number) => {
    const found = this.masterData.shipClasses.find((shipClass) => shipClass.id === ctype)

    return found || { id: ctype, key: "Unknown", name: "不明" }
  }

  private getShipAttrs = (shipId: number) =>
    this.masterData.shipAttrs.filter((attr) => attr.ids.includes(shipId)).map((attr) => attr.key) as ShipAttribute[]

  private getMasterShipEquippable = (shipId: number, stype: number): MasterShipEquippable => {
    const { equip_ship, equip_stype, equip_exslot, equip_exslot_ship } = this.masterData.equippable

    const categoryIds =
      equip_ship.find((ship) => ship.api_ship_id === shipId)?.api_equip_type ||
      equip_stype.find(({ id }) => id === stype)?.equip_type ||
      []

    const exslotIds = equip_exslot_ship
      .filter(({ api_ship_ids }) => api_ship_ids.includes(shipId))
      .map(({ api_slotitem_id }) => api_slotitem_id)

    return {
      categoryIds,
      exslotCategoryIds: equip_exslot,
      exslotIds,
    }
  }

  private createMasterShip = (masterDataShip: MasterDataShip) => {
    const { id, stype, ctype } = masterDataShip

    const shipTypeData = this.getShipTypeData(stype)
    const shipClassData = this.getShipClassData(ctype)
    const attrs = this.getShipAttrs(id)
    const equippable = this.getMasterShipEquippable(id, stype)

    const additionalData = {
      shipType: shipTypeData.key as ShipType,
      shipTypeName: shipTypeData.name,
      shipClass: shipClassData.key as ShipClass,
      shipClassName: shipClassData.name,
      attrs,
      equippable,
    }

    return new MasterShipImpl(masterDataShip, additionalData)
  }
}
