import { cloneJson, MasterData, Start2 } from "@fleethub/utils/src"
import { isEqual } from "lodash"
import immer from "immer"

import MasterDataSpreadsheet from "./MasterDataSpreadsheet"
import { fetchStart2, mergeStart2 } from "./start2"
import storage from "./storage"
import { updateImage } from "./cloudinary"

const equalJson = (arg1: unknown, arg2: unknown) => isEqual(cloneJson(arg1), cloneJson(arg2))

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return "Unknown error"
}

type MasterDataClientCache = {
  spreadsheet?: MasterDataSpreadsheet
  start2?: Start2
  sheetMd?: MasterData
  storageMd?: MasterData
}

export default class MasterDataClient {
  #cache: MasterDataClientCache = {}

  public getStart2 = async () => {
    return (this.#cache.start2 ??= await fetchStart2())
  }

  public getSpreadsheet = async () => {
    if (this.#cache.spreadsheet) return this.#cache.spreadsheet
    return (this.#cache.spreadsheet ??= await MasterDataSpreadsheet.init())
  }

  public getSheetMd = async () => {
    const cached = this.#cache.sheetMd
    if (cached) return cached

    const ss = await this.getSpreadsheet()
    return (this.#cache.sheetMd = await ss.read())
  }

  public getStorageMd = async () => {
    return (this.#cache.storageMd ??= await storage.read())
  }

  public updateSheet = async () => {
    const [start2, sheetMd] = await Promise.all([this.getStart2(), this.getSheetMd()])
    const ss = await this.getSpreadsheet()
    const mergedMd = mergeStart2(sheetMd, start2)

    if (equalJson(sheetMd, mergedMd)) {
      console.log("sheet: Not Modified")
    } else {
      console.log("sheet: Update")
      ss.write(mergedMd)
    }

    return mergedMd
  }

  public updateData = async () => {
    const updatedSheetMd = await this.updateSheet()
    const storageMd = await this.getStorageMd()

    const latestMd = immer(updatedSheetMd, (draft) => {
      draft.ships.forEach((sheetShip) => {
        const storageShip = storageMd.ships.find((storageShip) => storageShip.id === sheetShip.id)
        sheetShip.banner = storageShip?.banner || ""
      })
    })

    if (equalJson(latestMd, storageMd)) {
      console.log("storage: Not Modified")
      await storage.write(latestMd)
    } else {
      console.log("storage: Update")
      await storage.write(latestMd)
    }
  }

  public updateImage = () => updateImage()

  public log = async (message: string) => {
    console.log(message)
    const ss = await this.getSpreadsheet()
    const sheet = ss.doc.sheetsByTitle["管理"]
    await sheet.addRow([new Date().toLocaleString("ja-JP"), message])
  }

  public error = (error: unknown) => {
    return this.log(getErrorMessage(error))
  }
}
