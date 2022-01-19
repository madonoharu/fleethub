import { verifyGasIdToken } from "./auth";
import { updateCloudinary } from "./cloudinary";
import { MasterDataSpreadsheet } from "./spreadsheet";
import * as storage from "./storage";
import { fetchStart2 } from "./utils";

export async function updateMasterDataBySpreadsheet(): Promise<void> {
  const [mdSheet, start2, currentMd] = await Promise.all([
    MasterDataSpreadsheet.init(),
    fetchStart2(),
    storage.readMasterData(),
  ]);

  const nextMd = mdSheet.createMasterData(start2);

  await Promise.all([
    storage.mergeMasterData(currentMd, nextMd),
    mdSheet.writeMasterData(nextMd),
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
export { verifyGasIdToken, fetchStart2, storage };
export * from "./spreadsheet";
export * from "./credentials";
