import { GoogleSpreadsheet, ServiceAccountCredentials } from "google-spreadsheet"

import { MasterData } from "../types"
import EnumSheet from "./EnumSheet"
import MasterDataGearsSheet from "./MasterDataGearsSheet"
import MasterDataShipsSheet from "./MasterDataShipsSheet"

const sheetKeys = ["shipTypes", "shipClasses", "gearCategories", "ships", "gears"] as const

export const initSpreadsheet = async (serviceAccount: ServiceAccountCredentials) => {
  const doc = new GoogleSpreadsheet("1IQRy3OyMToqqkopCkQY9zoWW-Snf7OjdrALqwciyyRA")
  await doc.useServiceAccountAuth(serviceAccount)
  await doc.loadInfo()

  return doc
}

export default class MasterDataSpreadsheet {
  static init = async (serviceAccount: ServiceAccountCredentials) => {
    const doc = await initSpreadsheet(serviceAccount)

    return new MasterDataSpreadsheet(doc)
  }

  sheets = {
    shipTypes: new EnumSheet(this.doc.sheetsByTitle["艦種データ"]),
    shipClasses: new EnumSheet(this.doc.sheetsByTitle["艦級データ"]),
    gearCategories: new EnumSheet(this.doc.sheetsByTitle["装備カテゴリデータ"]),

    ships: MasterDataShipsSheet.from(this.doc),
    gears: MasterDataGearsSheet.from(this.doc),
  }

  private constructor(public doc: GoogleSpreadsheet) {}

  read = async (): Promise<MasterData> => {
    const md = {} as MasterData

    const readByKey = async (key: keyof MasterData) => {
      md[key] = (await this.sheets[key].read()) as any
    }

    await Promise.all(sheetKeys.map(readByKey))

    return md
  }

  write = async (md: MasterData) => {
    const writeByKey = (key: keyof MasterData) => this.sheets[key].write(md[key] as any)

    await Promise.all(sheetKeys.map(writeByKey))
  }
}

export { getDefaultMasterDataShip } from "./MasterDataShipsSheet"
