import MasterDataSpreadsheet from "./MasterDataSpreadsheet"
import { fetchStart2, mergeStart2 } from "./start2"
import * as storage from "./storage"

export const importStart2 = async () => {
  const ss = await MasterDataSpreadsheet.init()
  const [md, start2] = await Promise.all([ss.read(), fetchStart2()])

  const merged = mergeStart2(md, start2)

  await ss.write(merged)
}

export const upload = async () => {
  const ss = await MasterDataSpreadsheet.init()
  const md = await ss.read()
  await storage.write(md)
}

export const update = async () => {
  const ss = await MasterDataSpreadsheet.init()
  const [md, start2] = await Promise.all([ss.read(), fetchStart2()])

  const merged = mergeStart2(md, start2)
  await Promise.all([ss.write(merged), storage.write(merged)])
}
