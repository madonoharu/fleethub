import { verifyGasIdToken } from "./auth";
import { updateCloudinary } from "./cloudinary";
import { getGoogleSpreadsheet, MasterDataSpreadsheet } from "./spreadsheet";
import * as storage from "./storage";
import { fetchStart2 } from "./utils";

export const log = async (message: string) => {
  const doc = await getGoogleSpreadsheet();
  const sheet = doc.sheetsByTitle["管理"];
  await sheet.addRow([
    new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }),
    message,
  ]);
};

export const updateMasterDataBySpreadsheet = async () => {
  const [mdSheet, start2, currentMd] = await Promise.all([
    MasterDataSpreadsheet.read(),
    fetchStart2(),
    storage.readMasterData(),
  ]);

  const nextMd = mdSheet.createMasterData(start2);

  await Promise.all([
    storage.mergeMasterData(currentMd, nextMd),
    mdSheet.writeMasterData(nextMd),
  ]);
};

export const updateImages = async () => {
  const start2 = await fetchStart2();
  const ship_banners = await updateCloudinary(start2);
  await storage.writeJson("data/ship_banners.json", ship_banners, {
    public: true,
    immutable: true,
  });
};

export { isProjectMember } from "./auth";
export { verifyGasIdToken, fetchStart2, storage };
export * from "./spreadsheet";
