import { MasterData, MasterEquippable } from "@fh/core";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { Start2 } from "kc-tools";

import { updateCloudinary } from "./cloudinary";
import { getConstants } from "./constants";
import { updateGearData } from "./gear";
import { getGoogleSpreadsheet } from "./google";
import { updateShipData } from "./ship";
import { updateMaster } from "./storage";
import { fetchStart2 } from "./utils";

export const log = async (message: string) => {
  const doc = await getGoogleSpreadsheet();
  const sheet = doc.sheetsByTitle["管理"];
  await sheet.addRow([
    new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }),
    message,
  ]);
};

const createEquippable = (start2: Start2): MasterEquippable => {
  const equip_exslot = start2.api_mst_equip_exslot;
  const equip_ship = start2.api_mst_equip_ship;
  const equip_exslot_ship = start2.api_mst_equip_exslot_ship;

  const equip_stype = start2.api_mst_stype.map((stype) => {
    const id = stype.api_id;
    const equip_type = Object.entries(stype.api_equip_type)
      .filter(([, equippable]) => equippable === 1)
      .map(([gtype]) => Number(gtype));

    return { id, equip_type };
  });

  return { equip_stype, equip_exslot, equip_ship, equip_exslot_ship };
};

const createMasterData = async (
  doc: GoogleSpreadsheet,
  start2: Start2
): Promise<Partial<MasterData>> => {
  const [shipData, gearData, constants] = await Promise.all([
    updateShipData(doc, start2),
    updateGearData(doc, start2),
    getConstants(doc),
  ]);
  const equippable = createEquippable(start2);

  const { ships, ship_attrs } = shipData;
  const { gears, gear_attrs, ibonuses } = gearData;

  return {
    ships,
    ship_attrs,
    gears,
    gear_attrs,
    ibonuses,
    equippable,
    constants,
  };
};

export const updateData = async () => {
  const [doc, start2] = await Promise.all([
    getGoogleSpreadsheet(),
    fetchStart2(),
  ]);
  await log("Start: update_data");

  const nextMd = await createMasterData(doc, start2);

  const keys = Object.keys(nextMd) as (keyof MasterData)[];

  const promises = keys.map((key) => {
    const next = nextMd[key];
    return next && updateMaster(key, () => next);
  });

  await Promise.all(promises);

  await log("Success: update_data");
};

export const updateImages = async () => {
  const start2 = await fetchStart2();
  await log("Start: update_images");

  const banners = await updateCloudinary(start2);
  await updateMaster("ship_banners", () => banners);

  await log("Success: update_images");
};

export { getGoogleSpreadsheet, updateShipData, updateGearData };
