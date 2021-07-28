import {
  MasterAttrRule,
  MasterShipInput,
  MasterVariantDef,
  SpeedGroup,
} from "@fleethub/core/types";
import { ShipClass, ShipType } from "@fleethub/utils/src";
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from "google-spreadsheet";
import { MstPlayerShip, MstShip, Start2 } from "kc-tools";
import set from "lodash/set";

import { updateRows } from "./utils";

const isPlayerShip = (ship: MstShip): ship is MstPlayerShip =>
  "api_houg" in ship;

const getDefaultSpeedGroup = ({
  name,
  yomi,
  stype,
  ctype,
  speed,
}: MasterShipInput): SpeedGroup => {
  const isFastAV = stype == ShipType.AV && speed == 10;

  if (
    isFastAV ||
    [ShipType.SS, ShipType.SSV].includes(stype) ||
    ["夕張", "夕張改"].includes(name) ||
    [
      ShipClass.KagaClass,
      ShipClass.R1,
      ShipClass.RepairShip,
      ShipClass.RevisedKazahayaClass,
    ].includes(ctype || 0)
  ) {
    return "C";
  }

  if (
    [
      ShipClass.ShimakazeClass,
      ShipClass.TashkentClass,
      ShipClass.TaihouClass,
      ShipClass.ShoukakuClass,
      ShipClass.ToneClass,
      ShipClass.MogamiClass,
    ].includes(ctype || 0)
  ) {
    return "A";
  }

  if (
    [
      ShipClass.AganoClass,
      ShipClass.SouryuuClass,
      ShipClass.HiryuuClass,
      ShipClass.KongouClass,
      ShipClass.YamatoClass,
      ShipClass.IowaClass,
    ].includes(ctype || 0)
  ) {
    return "B1";
  }

  const isAmatsukaze = yomi === "あまつかぜ";
  const isUnryuu = yomi === "うんりゅう";
  const isAmagi = yomi === "あまぎ";
  const isNagatoKai2 = name === "長門改二";

  if (isAmatsukaze || isUnryuu || isAmagi || isNagatoKai2) {
    return "B1";
  }

  return "B2";
};

const getConvertibleShips = (ships: MasterShipInput[]) => {
  const findNextShip = ({ next_id }: MasterShipInput) =>
    next_id ? ships.find((s) => s.ship_id === next_id) : undefined;

  const convertibleShips: MasterShipInput[] = [];
  const irreversibleShips: MasterShipInput[] = [];

  const isConvertible = (base: MasterShipInput): boolean => {
    if (!base.next_id || irreversibleShips.includes(base)) return false;
    if (convertibleShips.includes(base)) return true;

    const remodelList: MasterShipInput[] = [];

    const setRemodelList = (
      current: MasterShipInput
    ): MasterShipInput | undefined => {
      remodelList.push(current);
      const next = findNextShip(current);
      if (!next) return current;

      const index = remodelList.findIndex((s) => s === next);
      if (index < 0) {
        return setRemodelList(next);
      }

      convertibleShips.push(...remodelList.slice(index));
      irreversibleShips.push(...remodelList.slice(0, index));

      return;
    };

    setRemodelList(base);

    return convertibleShips.includes(base);
  };

  return ships.filter(isConvertible);
};

export const createShips = (
  headerValues: string[],
  rows: GoogleSpreadsheetRow[],
  start2: Start2
) => {
  const createShip = (mst: MstShip): MasterShipInput => {
    const row = rows.find((row) => Number(row.ship_id) === mst.api_id);

    const base: MasterShipInput = {
      ship_id: mst.api_id,
      name: mst.api_name,
      yomi: mst.api_yomi,
      sort_id: mst.api_sort_id,
      stype: mst.api_stype,
      slotnum: mst.api_slot_num,
      speed: mst.api_soku,

      max_hp: [null, null],
      firepower: [null, null],
      armor: [null, null],
      torpedo: [null, null],
      evasion: [null, null],
      anti_air: [null, null],
      asw: [null, null],
      los: [null, null],
      luck: [null, null],
      slots: [],
      stock: [],
    };

    if (row) {
      headerValues.forEach((h) => {
        const value = row[h];

        if (value === "" || value === undefined) return;

        if (h === "name" || h === "yomi" || h === "speed_group") {
          set(base, h, String(value));
        } else if (value === "TRUE") {
          set(base, h, true);
        } else if (value !== "FALSE") {
          if (Number.isNaN(Number(value))) {
            console.log(h, value);
          }
          set(base, h, Number(value));
        }
      });
    }

    if (!isPlayerShip(mst)) return base;

    const { api_aftershipid, api_afterlv, api_tais } = mst;

    return {
      speed_group: getDefaultSpeedGroup(base),
      ...base,
      ctype: mst.api_ctype,

      max_hp: mst.api_taik,
      firepower: mst.api_houg,
      torpedo: mst.api_raig,
      anti_air: mst.api_tyku,
      armor: mst.api_souk,
      asw: api_tais ? [api_tais[0], api_tais[0]] : base.asw,
      luck: mst.api_luck,
      range: mst.api_leng,

      fuel: mst.api_fuel_max,
      ammo: mst.api_bull_max,

      next_id: Number(api_aftershipid) || null,
      next_level: api_afterlv || null,
    };
  };

  const ships = start2.api_mst_ship.map((ship) => createShip(ship));

  getConvertibleShips(ships).forEach((ship) => {
    ship.useful = true;
  });

  return ships;
};

const createShipTypes = (rows: GoogleSpreadsheetRow[], start2: Start2) =>
  start2.api_mst_stype.map((mst) => {
    const row = rows.find((row) => row.id == mst.api_id);
    return {
      id: mst.api_id,
      name: mst.api_name,
      tag: row?.tag,
    };
  });

const createShipClasses = (rows: GoogleSpreadsheetRow[]) =>
  rows.map((row) => ({
    id: Number(row.id),
    tag: row.tag,
    name: row.name,
  }));

const readShipAttrs = async (
  sheet: GoogleSpreadsheetWorksheet,
  ships: MasterShipInput[],
  ship_types: MasterVariantDef[],
  ship_classes: MasterVariantDef[]
): Promise<MasterAttrRule[]> => {
  const rows = await sheet.getRows();

  const attrs: MasterAttrRule[] = [];

  const replaceShipType = (str: string) => {
    return ship_types.reduce(
      (current, { name, id }) => current.replace(`"${name}"`, id.toString()),
      str
    );
  };

  const replaceShipClass = (str: string) => {
    return ship_classes.reduce(
      (current, { name, id }) => current.replace(`"${name}"`, id.toString()),
      str
    );
  };

  const replaceName = (str: string) =>
    ships.reduce(
      (current, ship) =>
        current.replace(`"${ship.name}"`, ship.ship_id.toString()),
      str
    );

  const replaceAttr = (str: string) =>
    attrs.reduce(
      (current, attr) =>
        current.replace(RegExp(`\\b${attr.tag}\\b`, "g"), attr.expr),
      str
    );

  const replaceExpr = (str: string) =>
    replaceAttr(str)
      .replace(/ship_type == "[^"]+"/g, replaceShipType)
      .replace(/ship_class == "[^"]+"/g, replaceShipClass)
      .replace(/name == "[^"]+"/g, replaceName)
      .replace(/ship_type_in\(\s*("[^"]+",?\s*)+\)/gs, replaceShipType)
      .replace(/ship_class_in\(\s*("[^"]+",?\s*)+\)/gs, replaceShipClass)
      .replace(/name_in\(\s*("[^"]+",?\s*)+\)/gs, replaceName)
      .replace(/\bname/g, "ship_id")
      .replace(/\n/g, " ")
      .replace(/\s{2,}/g, " ");

  rows.forEach((row) => {
    const expr = replaceExpr(row.expr);
    attrs.push({ tag: row.tag, name: row.name, expr });
  });

  return attrs;
};

export const updateShipData = async (
  doc: GoogleSpreadsheet,
  start2: Start2
) => {
  const shipsSheet = doc.sheetsByTitle["艦娘"];
  const shipTypesSheet = doc.sheetsByTitle["艦種"];
  const shipClassesSheet = doc.sheetsByTitle["艦級"];
  const shipAttrsSheet = doc.sheetsByTitle["艦娘属性"];

  const [ships, ship_types, ship_classes] = await Promise.all([
    updateRows(shipsSheet, (rows, sheet) =>
      createShips(sheet.headerValues, rows, start2)
    ),
    updateRows(shipTypesSheet, (rows) => createShipTypes(rows, start2)),
    updateRows(shipClassesSheet, createShipClasses),
  ]);

  const ship_attrs = await readShipAttrs(
    shipAttrsSheet,
    ships,
    ship_types,
    ship_classes
  );

  const data = {
    ships,
    ship_types,
    ship_classes,
    ship_attrs,
  };

  return data;
};
