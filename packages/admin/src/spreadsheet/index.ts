import { MasterData, MasterEquippable } from "fleethub-core";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { Start2 } from "kc-tools";

import { getServiceAccount } from "../credentials";
import { fetchStart2 } from "../utils";
import { getConstants } from "./constants";
import { updateGearData } from "./gear";
import { updateShipData } from "./ship";

const SHEET_ID = "1IQRy3OyMToqqkopCkQY9zoWW-Snf7OjdrALqwciyyRA";
const doc = new GoogleSpreadsheet(SHEET_ID);

let initialized = false;

export const getGoogleSpreadsheet = async () => {
  if (initialized) return doc;

  const serviceAccount = getServiceAccount();
  await doc.useServiceAccountAuth(serviceAccount);
  await doc.loadInfo();

  initialized = true;

  return doc;
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

export const readSpreadsheetMasterData = async () => {
  const [doc, start2] = await Promise.all([
    getGoogleSpreadsheet(),
    fetchStart2(),
  ]);
  return await createMasterData(doc, start2);
};

export { updateShipData, updateGearData };
