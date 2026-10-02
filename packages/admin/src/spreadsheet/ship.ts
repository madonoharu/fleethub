import { ShipClass, ShipType } from "@fh/utils";
import {
  MasterAttrRule,
  MasterData,
  MasterShip,
  ShipAttr,
  SpeedGroup,
} from "fleethub-core";
import { MstPlayerShip, MstShip } from "kc-tools";
import { set } from "es-toolkit/compat";

import { SpreadsheetTable } from "./SpreadsheetTable";
import { ExprParser } from "./parser";
import { toCellString } from "./utils";

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
  const isFastAV = (stype as ShipType) == ShipType.AV && speed == 10;

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
  const shipsById = new Map<number, MasterShip>();
  for (const ship of ships) {
    if (!shipsById.has(ship.ship_id)) shipsById.set(ship.ship_id, ship);
  }

  const completed = new Set<MasterShip>();
  const convertible = new Set<MasterShip>();

  for (const base of ships) {
    const path: MasterShip[] = [];
    const indices = new Map<MasterShip, number>();
    let current: MasterShip | undefined = base;

    while (current && !completed.has(current)) {
      const cycleStart = indices.get(current);
      if (cycleStart !== undefined) {
        path.slice(cycleStart).forEach((ship) => convertible.add(ship));
        break;
      }

      indices.set(current, path.length);
      path.push(current);
      current = current.next_id ? shipsById.get(current.next_id) : undefined;
    }

    path.forEach((ship) => completed.add(ship));
  }

  return ships.filter((ship) => convertible.has(ship));
};

function createShips(
  parser: ExprParser,
  table: SpreadsheetTable,
): MasterShip[] {
  const { start2, nationalityMap } = parser;
  const { headerValues, rows } = table;

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
        const value = row[h];
        if (value !== "" && value !== undefined && value !== false) {
          set(base, h, value);
        }
      });
    }

    if (isPlayerShip(mst)) {
      const { api_aftershipid, api_afterlv } = mst;
      const ship: MasterShip = {
        nationality: nationalityMap.getByCtype(mst.api_ctype),
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
        (s) => s.api_name === baseName,
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
}

const createShipAttrs = (parser: ExprParser, table: SpreadsheetTable) => {
  const attrs: MasterAttrRule<ShipAttr>[] = [];

  table.rows.forEach((row) => {
    const str = toCellString(row.expr);
    const expr = parser.parseShip(str);

    attrs.push({
      tag: toCellString(row.tag) as ShipAttr,
      name: toCellString(row.name),
      expr,
    });
  });

  return attrs;
};

export function createShipData(
  parser: ExprParser,
  tables: Record<"ships" | "ship_attrs" | "nationalities", SpreadsheetTable>,
): Pick<MasterData, "ships" | "ship_attrs"> {
  const ships = createShips(parser, tables.ships);
  const ship_attrs = createShipAttrs(parser, tables.ship_attrs);

  return {
    ships,
    ship_attrs,
  };
}
