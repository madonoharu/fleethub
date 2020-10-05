import { ServiceAccountCredentials } from "google-spreadsheet"
import MasterDataSpreadsheet from "./MasterDataSpreadsheet"
import { fetchStart2, mergeStart2 } from "./start2"
import * as storage from "./storage"

export const updateBySpreadsheet = async (serviceAccount: ServiceAccountCredentials) => {
  const ss = await MasterDataSpreadsheet.init(serviceAccount)
  const md = await ss.fetchMasterData()
  await storage.postMasterData(md)
}

export const updateByStart2 = async (serviceAccount: ServiceAccountCredentials) => {
  const ss = await MasterDataSpreadsheet.init(serviceAccount)
  const [md, start2] = await Promise.all([ss.fetchMasterData(), fetchStart2()])

  const merged = mergeStart2(md, start2)

  await Promise.all([ss.postMasterData(merged), storage.postMasterData(merged)])
}
