import { Start2 } from "kc-tools";
import ky from "ky";

import { updateCloudinary } from "./cloudinary";
import { createMasterData, MasterDataSpreadsheet } from "./spreadsheet";
import * as storage from "./storage";

const START2_URL =
  "https://raw.githubusercontent.com/shiro-sh39/api_start2/main/START2.json";

export async function fetchStart2(): Promise<Start2> {
  const { api_data } = await ky.get(START2_URL).json<{ api_data: Start2 }>();
  return api_data;
}

export function fetchCtypeNames(): Promise<string[]> {
  return ky
    .get(
      "https://raw.githubusercontent.com/KC3Kai/kc3-translations/master/data/en/ctype.json",
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

  const [start2, ctypeNames, currentMd, tables] = await Promise.all([
    fetchStart2(),
    fetchCtypeNames(),
    storage.readMasterData(),
    spreadsheet.readTables(),
  ]);

  const nextMd = createMasterData(start2, ctypeNames, tables);
  const updates = !storage.equalMasterData(currentMd, nextMd);

  await Promise.all([
    updates && storage.writeMasterData(nextMd),
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
export { storage };
export * from "./spreadsheet";
export * from "./credentials";
export * from "./kcnav";
export * from "./map";
