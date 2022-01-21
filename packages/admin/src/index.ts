import { dequal } from "dequal";
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

export async function updateMasterDataBySpreadsheet(): Promise<void> {
  const spreadsheet = new MasterDataSpreadsheet();

  const [tables, start2, currentMd] = await Promise.all([
    spreadsheet.readTables(),
    fetchStart2(),
    storage.readMasterData(),
  ]);

  const nextMd = createMasterData(tables, start2);
  const updatesStorage = dequal(currentMd, nextMd);
  console.log(updatesStorage);
  await Promise.all([
    updatesStorage && storage.writeMasterData(nextMd),
    spreadsheet.writeMasterData(tables, nextMd),
  ]);
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
