import { GoogleSpreadsheet } from "google-spreadsheet"

import { MasterData } from "../types"
import getServiceAccount from "../getServiceAccount"

import EnumSheet from "./EnumSheet"
import MasterDataGearsSheet from "./MasterDataGearsSheet"
import MasterDataShipsSheet from "./MasterDataShipsSheet"
import MasterDataAttrsSheet from "./MasterDataAttrsSheet"
import ImprovementBonusRulesSheet from "./ImprovementBonusRulesSheet"

export default class MasterDataSpreadsheet {
  static init = async () => {
    const serviceAccount = getServiceAccount()
    const doc = new GoogleSpreadsheet("1IQRy3OyMToqqkopCkQY9zoWW-Snf7OjdrALqwciyyRA")
    await doc.useServiceAccountAuth(serviceAccount)
    await doc.loadInfo()

    return new MasterDataSpreadsheet(doc)
  }

  sheets = {
    shipTypes: new EnumSheet(this.doc.sheetsByTitle["艦種データ"]),
    shipClasses: new EnumSheet(this.doc.sheetsByTitle["艦級データ"]),
    gearCategories: new EnumSheet(this.doc.sheetsByTitle["装備カテゴリデータ"]),

    ships: MasterDataShipsSheet.from(this.doc),
    gears: MasterDataGearsSheet.from(this.doc),

    gearAttrs: new MasterDataAttrsSheet(this.doc.sheetsByTitle["装備属性"]),
    shipAttrs: new MasterDataAttrsSheet(this.doc.sheetsByTitle["艦娘属性"]),

    improvementBonusRules: new ImprovementBonusRulesSheet(this.doc),
  }

  private constructor(public doc: GoogleSpreadsheet) {}

  read = async (): Promise<MasterData> => {
    const { sheets } = this
    const md = {} as MasterData

    const promises = Object.entries(sheets).map(async ([key, sheet]) => {
      md[key as keyof typeof sheets] = (await sheet.read()) as any
    })

    await Promise.all(promises)

    return md
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

export { getDefaultMasterDataShip } from "./MasterDataShipsSheet"
