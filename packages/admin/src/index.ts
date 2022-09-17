import got from "got";
import { Start2 } from "kc-tools";

import { verifyGasIdToken } from "./auth";
import { updateCloudinary } from "./cloudinary";
import { createMasterData, MasterDataSpreadsheet } from "./spreadsheet";
import * as storage from "./storage";

export function fetchStart2(): Promise<Start2> {
  return got
    .get(
      "https://raw.githubusercontent.com/Tibowl/api_start2/master/start2.json"
    )
    .json();
}

export function fetchCtypeNames(): Promise<string[]> {
  return got
    .get(
      "https://raw.githubusercontent.com/KC3Kai/kc3-translations/master/data/en/ctype.json"
    )
    .json();
}

export async function createMasterDataBySpreadsheet() {
  const spreadsheet = new MasterDataSpreadsheet();

  const [start2, ctypeNames, tables] = await Promise.all([
    fetchStart2(),
    fetchCtypeNames(),
    spreadsheet.readTables(),
  ]);

  return createMasterData(start2, ctypeNames, tables);
}

export async function updateMasterDataBySpreadsheet(): Promise<void> {
  const spreadsheet = new MasterDataSpreadsheet();

  const [start2, ctypeNames, tables, currentMd] = await Promise.all([
    fetchStart2(),
    fetchCtypeNames(),
    spreadsheet.readTables(),
    storage.readMasterData(),
  ]);

  const nextMd = createMasterData(start2, ctypeNames, tables);
  const updates = !storage.equalMasterData(currentMd, nextMd);

  if (updates) {
    await storage.writeMasterData(nextMd);
  }
}

export async function updateImages(): Promise<void> {
  const start2 = await fetchStart2();
  const ship_banners = await updateCloudinary(start2);
  await storage.writeJson("data/ship_banners.json", ship_banners, {
    public: true,
    immutable: true,
  });
}

export { isProjectMember } from "./auth";
export { verifyGasIdToken, storage };
export * from "./spreadsheet";
export * from "./credentials";
export * from "./kcnav";
export * from "./map";
