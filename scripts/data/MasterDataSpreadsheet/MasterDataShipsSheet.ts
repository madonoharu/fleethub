import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from "google-spreadsheet"
import { MasterDataShip, SheetRow, StatInterval } from "@fleethub/utils/src"
import { get, set } from "lodash"

import toHeaderKeyValues from "./toHeaderKeyValues"
import writeRows from "./writeRows"

const getDefaultInterval = (): StatInterval => [null, null]

export const getDefaultMasterDataShip = (): MasterDataShip => ({
  id: 0,
  name: "",
  yomi: "",
  shipType: 0,
  shipClass: 0,

  maxHp: getDefaultInterval(),
  firepower: getDefaultInterval(),
  armor: getDefaultInterval(),
  torpedo: getDefaultInterval(),
  evasion: getDefaultInterval(),
  antiAir: getDefaultInterval(),
  asw: getDefaultInterval(),
  los: getDefaultInterval(),
  luck: getDefaultInterval(),

  speed: 0,
  range: null,
  slotnum: 0,
  slots: [],
  stock: [],
})

export default class MasterDataShipsSheet {
  constructor(public sheet: GoogleSpreadsheetWorksheet) {}

  fetchHeaderKeyValues = async () => {
    const { sheet } = this
    await sheet.loadHeaderRow()
    return toHeaderKeyValues<keyof MasterDataShip>(sheet.headerValues)
  }

  read = async () => {
    const rows = await this.sheet.getRows()
    const headerKeyValues = await this.fetchHeaderKeyValues()

    const rowToShip = (row: SheetRow) => {
      const ship = getDefaultMasterDataShip()

      headerKeyValues.forEach(({ headerValue, key }) => {
        const value = row[headerValue]

        if (!value) return

        if (key === "name" || key === "yomi") {
          set(ship, key, String(value))
        } else {
          set(ship, key, Number(value))
        }
      })

      return ship
    }

    return rows.map(rowToShip)
  }

  write = async (ships: MasterDataShip[]) => {
    const headerKeyValues = await this.fetchHeaderKeyValues()

    const shipToRow = (ship: MasterDataShip) => {
      const row: SheetRow = {}

      headerKeyValues.forEach(({ headerValue, key }) => {
        const value = get(ship, key)

        if (value === null) return

        if (typeof value === "object") {
          row[headerValue] = JSON.stringify(value)
        } else {
          row[headerValue] = value
        }
      })

      return row
    }

    const rows = ships.map(shipToRow)
    writeRows(this.sheet, rows)
  }
}
