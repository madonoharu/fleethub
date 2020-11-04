import { GoogleSpreadsheet } from "google-spreadsheet"
import { MasterData } from "@fleethub/utils/src"

import getGoogleSpreadsheet from "../getGoogleSpreadsheet"

import EnumSheet from "./EnumSheet"
import MasterDataGearsSheet from "./MasterDataGearsSheet"
import MasterDataShipsSheet from "./MasterDataShipsSheet"
import MasterDataAttrsSheet from "./MasterDataAttrsSheet"
import ImprovementBonusSheets from "./ImprovementBonusSheets"
import parseShipAttrs from "./parseShipAttrs"
import parseGearSheets from "./parseGearSheets"

export default class MasterDataSpreadsheet {
  static init = async () => {
    const doc = await getGoogleSpreadsheet()
    return new MasterDataSpreadsheet(doc)
  }

  sheets = {
    ships: new MasterDataShipsSheet(this.doc.sheetsByTitle["艦娘データ"]),
    shipTypes: new EnumSheet(this.doc.sheetsByTitle["艦種データ"]),
    shipClasses: new EnumSheet(this.doc.sheetsByTitle["艦級データ"]),
    shipAttrs: new MasterDataAttrsSheet(this.doc.sheetsByTitle["艦娘属性"]),

    gears: new MasterDataGearsSheet(this.doc.sheetsByTitle["装備データ"]),
    gearCategories: new EnumSheet(this.doc.sheetsByTitle["装備カテゴリデータ"]),
    gearAttrs: new MasterDataAttrsSheet(this.doc.sheetsByTitle["装備属性"]),

    improvementBonuses: new ImprovementBonusSheets(this.doc),
  }

  private constructor(public doc: GoogleSpreadsheet) {}

  read = async (): Promise<MasterData> => {
    const { sheets } = this

    const [
      ships,
      shipTypes,
      shipClasses,
      shipAttrsSheetRows,
      gears,
      gearCategories,
      gearAttrsSheetRows,
      improvementBonusSheets,
    ] = await Promise.all([
      sheets.ships.read(),
      sheets.shipTypes.read(),
      sheets.shipClasses.read(),
      sheets.shipAttrs.read(),

      sheets.gears.read(),
      sheets.gearCategories.read(),
      sheets.gearAttrs.read(),
      sheets.improvementBonuses.read(),
    ])

    const shipAttrs = parseShipAttrs(ships, shipAttrsSheetRows)
    const { gearAttrs, improvementBonuses } = parseGearSheets(
      gears,
      gearCategories,
      gearAttrsSheetRows,
      improvementBonusSheets
    )

    return {
      ships,
      shipTypes,
      shipClasses,
      shipAttrs,

      gears,
      gearCategories,
      gearAttrs,
      improvementBonuses,
      equippable: { equip_stype: [], equip_exslot: [], equip_ship: [], equip_exslot_ship: [] },
    }
  }

  write = async (md: MasterData) => {
    const { sheets } = this

    await Promise.all([
      sheets.shipClasses.write(md.shipClasses),
      sheets.gearCategories.write(md.gearCategories),
      sheets.ships.write(md.ships),
      sheets.gears.write(md.gears),
    ])
  }
}
