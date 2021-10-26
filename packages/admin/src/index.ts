import { AssetServiceClient } from "@google-cloud/asset";

import { verifyGasIdToken } from "./auth";
import { updateCloudinary } from "./cloudinary";
import { getServiceAccount } from "./credentials";
import { getGoogleSpreadsheet, readSpreadsheetMasterData } from "./spreadsheet";
import * as storage from "./storage";
import { fetchStart2 } from "./utils";

export const isProjectMember = async (idToken: string) => {
  const email = (await verifyGasIdToken(idToken))?.email || "";

  const assetServiceClient = new AssetServiceClient({
    credentials: getServiceAccount(),
  });

  const [analyzeIamPolicyResponse] = await assetServiceClient.analyzeIamPolicy({
    analysisQuery: {
      scope: "projects/kcfleethub",
      identitySelector: {
        identity: `user:${email}`,
      },
    },
  });

  return analyzeIamPolicyResponse.mainAnalysis?.analysisResults?.some(
    (ima) => ima.iamBinding?.role === "roles/viewer"
  );
};

export const log = async (message: string) => {
  const doc = await getGoogleSpreadsheet();
  const sheet = doc.sheetsByTitle["管理"];
  await sheet.addRow([
    new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }),
    message,
  ]);
};

export const updateMasterDataBySpreadsheet = async () => {
  await log("Start: update_data");
  const next = await readSpreadsheetMasterData();
  await storage.mergeMasterData(next);
  await log("Success: update_data");
};

export const updateImages = async () => {
  const start2 = await fetchStart2();
  await log("Start: update_images");

  const ship_banners = await updateCloudinary(start2);
  await storage.mergeMasterData({ ship_banners });

  await log("Success: update_images");
};

export { verifyGasIdToken, fetchStart2, storage, getGoogleSpreadsheet };
