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

import { MasterGear } from "../gear"

import MasterShipImpl, { MasterShipEquippable } from "./MasterShipImpl"

export default class MasterDataAdapter {
  public gears: MasterGear[]
  public ships: MasterShipImpl[]

  constructor(public masterData: MasterData) {
    this.gears = masterData.gears.map(this.createMasterGear)
    this.ships = masterData.ships.map(this.createMasterShip)
  }

  private getGearCategory = (type2: number) => {
    const found = this.masterData.gearCategories.find((cat) => cat.id === type2)?.key
    return found || ""
  }

  private getGearAttrs = (gearId: number) => {
    return this.masterData.gearAttrs.filter((data) => data.ids.includes(gearId)).map((data) => data.key)
  }

  private getImprovementBonusFormulas = (gearId: number) =>
    mapValues(this.masterData.improvementBonuses, (rules) => {
      return rules.find((rule) => rule.ids.includes(gearId))?.formula
    })

  private createMasterGear = (masterDataGear: MasterDataGear) => {
    const category = this.getGearCategory(masterDataGear.types[2]) as GearCategory
    const attrs = this.getGearAttrs(masterDataGear.id) as GearAttribute[]
    const improvementBonusFormulas = this.getImprovementBonusFormulas(masterDataGear.id)

    return new MasterGear(masterDataGear, { category, attrs, improvementBonusFormulas })
  }

  private getShipType = (stype: number) => {
    const found = this.masterData.shipTypes.find((shipType) => shipType.id === stype)?.key
    return (found || "") as ShipType
  }

  private getShipClass = (ctype: number) => {
    const found = this.masterData.shipClasses.find((shipClass) => shipClass.id === ctype)?.key
    return (found || "") as ShipClass
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

    const shipType = this.getShipType(stype)
    const shipClass = this.getShipClass(ctype)
    const attrs = this.getShipAttrs(id)
    const equippable = this.getMasterShipEquippable(id, stype)

    return new MasterShipImpl(masterDataShip, { shipType, shipClass, attrs, equippable })
  }
}
