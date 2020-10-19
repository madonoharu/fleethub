import { cloneJson, MasterData, Start2 } from "@fleethub/utils/src"
import { isEqual } from "lodash"
import signale from "signale"

import MasterDataSpreadsheet from "./MasterDataSpreadsheet"
import { fetchStart2, mergeStart2 } from "./start2"
import * as storage from "./storage"

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
  mergedMd?: MasterData
  storageMd?: MasterData
}

export default class MasterDataClient {
  #cache: MasterDataClientCache = {}

  public getSpreadsheet = async () => {
    if (this.#cache.spreadsheet) return this.#cache.spreadsheet
    console.log(1)
    return (this.#cache.spreadsheet ??= await MasterDataSpreadsheet.init())
  }

  public getStart2 = async () => {
    return (this.#cache.start2 ??= await fetchStart2())
  }

  public getSheetMd = async () => {
    const cached = this.#cache.sheetMd
    if (cached) return cached

    const mdss = await this.getSpreadsheet()
    return (this.#cache.sheetMd = await mdss.read())
  }

  public getMergedMd = async () => {
    const cached = this.#cache.mergedMd
    if (cached) return cached

    const [sheetMd, start2] = await Promise.all([this.getSheetMd(), fetchStart2()])
    const mergedMd = mergeStart2(sheetMd, start2)

    return (this.#cache.mergedMd = mergedMd)
  }

  public getStorageMd = async () => {
    return (this.#cache.storageMd ??= await storage.read())
  }

  public update = async () => {
    this.log("start: update")
    const [mergedMd, storageMd] = await Promise.all([this.getMergedMd(), this.getStorageMd()])
    const ss = await this.getSpreadsheet()
    const sheetMd = await this.getSheetMd()

    if (!equalJson(sheetMd, mergedMd)) {
      ss.write(mergedMd)
    }

    if (!equalJson(mergedMd, storageMd)) {
      storage.write(mergedMd)
    }

    this.log("success: update")
  }

  public log = async (message: string) => {
    const ss = await this.getSpreadsheet()
    const sheet = ss.doc.sheetsByTitle["管理"]
    await sheet.addRow([new Date().toLocaleString("ja-JP"), message])
  }

  public error = (error: unknown) => {
    signale.error(error)
    return this.log(getErrorMessage(error))
  }
}
