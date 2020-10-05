import { uniq } from "@fleethub/utils"
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetRow,
  WorksheetBasicProperties,
  ServiceAccountCredentials,
} from "google-spreadsheet"

import { MasterData, SheetRow } from "../types"
import MasterDataGearRecord from "./MasterDataGearRecord"
import MasterDataShipRecord from "./MasterDataShipRecord"

const keyTitleMap = {
  ships: "艦娘データ",
  shipTypes: "艦種データ",
  shipClasses: "艦級データ",

  gears: "装備データ",
  gearCategories: "装備カテゴリデータ",
}

export type SheetKey = keyof typeof keyTitleMap

export default class MasterDataSpreadsheet {
  static init = async (serviceAccount: ServiceAccountCredentials) => {
    const doc = new GoogleSpreadsheet("1IQRy3OyMToqqkopCkQY9zoWW-Snf7OjdrALqwciyyRA")
    await doc.useServiceAccountAuth(serviceAccount)
    await doc.loadInfo()

    return new MasterDataSpreadsheet(doc)
  }

  private constructor(public doc: GoogleSpreadsheet) {}

  getSheet = (key: SheetKey) => {
    const title = keyTitleMap[key]
    return this.doc.sheetsByTitle[title]
  }

  postSheet = async (key: SheetKey, rows: SheetRow[], headerValues?: string[]) => {
    const sheet = this.getSheet(key)
    const { frozenRowCount, frozenColumnCount } = sheet.gridProperties

    headerValues ??= uniq(rows.flatMap((row) => Object.keys(row)))

    await sheet.clear()
    await sheet.resize({
      rowCount: rows.length + 1,
      columnCount: headerValues.length,
      frozenRowCount,
      frozenColumnCount,
      hideGridlines: false,
      rowGroupControlAfter: false,
      columnGroupControlAfter: false,
    })
    await sheet.setHeaderRow(headerValues)
    await sheet.addRows(rows as GoogleSpreadsheetRow[])
  }

  fetchMasterData = async (): Promise<MasterData> => {
    const getIdNameKeySheet = async (sheetKey: "shipTypes" | "shipClasses" | "gearCategories") => {
      const rows = await this.getSheet(sheetKey).getRows()
      return rows.map(({ id, name, key }) => ({ id: Number(id), name, key }))
    }

    const shipsSheet = this.getSheet("ships")

    const [shipTypes, shipClasses, gearCategories] = await Promise.all([
      getIdNameKeySheet("shipTypes"),
      getIdNameKeySheet("shipClasses"),
      getIdNameKeySheet("gearCategories"),
    ])

    const shipsSheetRows = await shipsSheet.getRows()
    const ships = shipsSheetRows.map(MasterDataShipRecord.rowToShip)

    const gearsSheetRows = await this.getSheet("gears").getRows()
    const gears = gearsSheetRows.map(MasterDataGearRecord.rowToGear)

    return {
      ships,
      shipTypes,
      shipClasses,
      gears,
      gearCategories,
    }
  }

  postMasterData = async ({ ships, shipTypes, shipClasses, gears, gearCategories }: MasterData) => {
    const { postSheet } = this

    const shipsSheetRows = ships.map(MasterDataShipRecord.shipToRow)
    const gearsSheetRows = gears.map(MasterDataGearRecord.gearToRow)

    await Promise.all([
      postSheet("ships", shipsSheetRows, MasterDataShipRecord.headerValues),
      postSheet("shipTypes", shipTypes),
      postSheet("shipClasses", shipClasses),

      postSheet("gears", gearsSheetRows, MasterDataGearRecord.headerValues),
      postSheet("gearCategories", gearCategories),
    ])
  }
}

export { getDefaultMasterDataShip } from "./MasterDataShipRecord"
