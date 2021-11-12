import { ShipClass, ShipType } from "@fh/utils";
import {
  MasterAttrRule,
  MasterShip,
  MasterVariantDef,
  SpeedGroup,
} from "fleethub-core";
import { GoogleSpreadsheetRow } from "google-spreadsheet";
import { MstPlayerShip, MstShip, Start2 } from "kc-tools";
import set from "lodash/set";

import { MasterDataSpreadsheet } from "./sheet";

const SUFFIXES = [
  "甲",
  "乙",
  "丙",
  "丁",
  "戊",
  "特",
  "改二",
  "改II",
  "乙改",
  "丁改",
  "改",
  "航",
  "母",
  "護",
  " zwei",
  " drei",
  " due",
  " andra",
  " два",
  " Mod.2",
  " Mk.II",
  "後期型II",
  "後期型",
  " バカンスmode",
  " 夏季上陸mode",
  " 夏mode",
  "-壊",
];

const SUFFIX_RE = RegExp(`(${SUFFIXES.join("|")})+$`);

const isPlayerShip = (ship: MstShip): ship is MstPlayerShip =>
  "api_houg" in ship;

const getDefaultSpeedGroup = ({
  name,
  yomi,
  stype,
  ctype,
  speed,
}: MasterShip): SpeedGroup => {
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

const getConvertibleShips = (ships: MasterShip[]) => {
  const findNextShip = ({ next_id }: MasterShip) =>
    next_id ? ships.find((s) => s.ship_id === next_id) : undefined;

  const convertibleShips: MasterShip[] = [];
  const irreversibleShips: MasterShip[] = [];

  const isConvertible = (base: MasterShip): boolean => {
    if (!base.next_id || irreversibleShips.includes(base)) return false;
    if (convertibleShips.includes(base)) return true;

    const remodelList: MasterShip[] = [];

    const setRemodelList = (current: MasterShip): MasterShip | undefined => {
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

const createShips = (
  headerValues: string[],
  rows: GoogleSpreadsheetRow[],
  start2: Start2
) => {
  const createShip = (mst: MstShip): MasterShip => {
    const row = rows.find((row) => Number(row.ship_id) === mst.api_id);

    const base: MasterShip = {
      ship_id: mst.api_id,
      name: mst.api_name,
      yomi: mst.api_yomi,
      sort_id: mst.api_sort_id,
      stype: mst.api_stype,
      ctype: mst.api_ctype,
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
        const value: unknown = row[h];

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

    if (isPlayerShip(mst)) {
      const { api_aftershipid, api_afterlv } = mst;
      const ship: MasterShip = {
        speed_group: getDefaultSpeedGroup(base),
        ...base,

        max_hp: mst.api_taik,
        firepower: mst.api_houg,
        torpedo: mst.api_raig,
        anti_air: mst.api_tyku,
        armor: mst.api_souk,
        luck: mst.api_luck,
        range: mst.api_leng,

        fuel: mst.api_fuel_max,
        ammo: mst.api_bull_max,
      };

      const next_id = Number(api_aftershipid);
      const next_level = api_afterlv;
      if (next_id) {
        ship.next_id = next_id;
      }
      if (next_level) {
        ship.next_level = next_level;
      }

      return ship;
    } else {
      const baseName = mst.api_name.replace(SUFFIX_RE, "");
      const abyssal_ctype = start2.api_mst_ship.find(
        (s) => s.api_name === baseName
      )?.api_id;

      return {
        ...base,
        ctype: abyssal_ctype || 0,
      };
    }
  };

  const ships = start2.api_mst_ship.map((ship) => createShip(ship));

  getConvertibleShips(ships).forEach((ship) => {
    ship.useful = true;
  });

  return ships;
};

const createShipTypes = (rows: GoogleSpreadsheetRow[], start2: Start2) => {
  return start2.api_mst_stype.map((mst) => {
    const row = rows.find((row) => row.id == mst.api_id);
    return {
      id: mst.api_id,
      name: mst.api_name,
      tag: row?.tag as string | null,
    };
  });
};

const createShipClasses = (rows: GoogleSpreadsheetRow[]) => {
  return rows.map((row) => ({
    id: Number(row.id),
    tag: row.tag as string,
    name: row.name as string,
  }));
};

const createShipAttrs = (
  rows: GoogleSpreadsheetRow[],
  start2: Start2,
  ship_classes: MasterVariantDef[]
) => {
  const attrs: MasterAttrRule[] = [];

  const replaceShipType = (str: string) =>
    start2.api_mst_stype.reduce(
      (current, stype) =>
        current.replace(`"${stype.api_name}"`, stype.api_id.toString()),
      str
    );

  const replaceShipClass = (str: string) => {
    return ship_classes.reduce(
      (current, { name, id }) => current.replace(`"${name}"`, id.toString()),
      str
    );
  };

  const replaceName = (str: string) =>
    start2.api_mst_ship.reduce(
      (current, ship) =>
        current.replace(`"${ship.api_name}"`, ship.api_id.toString()),
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
    const expr = replaceExpr(row.expr as string);
    attrs.push({
      tag: row.tag as string,
      name: row.name as string,
      expr,
    });
  });

  return attrs;
};

export const createShipData = (
  mdSheet: MasterDataSpreadsheet,
  start2: Start2
) => {
  const sheets = mdSheet.pickSheets([
    "ships",
    "ship_types",
    "ship_classes",
    "ship_attars",
  ]);

  const ships = createShips(
    sheets.ships.inner.headerValues,
    sheets.ships.rows,
    start2
  );
  const ship_types = createShipTypes(sheets.ship_types.rows, start2);
  const ship_classes = createShipClasses(sheets.ship_classes.rows);
  const ship_attrs = createShipAttrs(
    sheets.ship_attars.rows,
    start2,
    ship_classes
  );

  return {
    ships,
    ship_types,
    ship_classes,
    ship_attrs,
  };
};
