import "dotenv/config";

import { storage, getGoogleSpreadsheet } from "@fh/admin/src";
import { updateRows } from "@fh/admin/src/utils";
import { nonNullable } from "@fh/utils/src";
import { SaveOptions } from "@google-cloud/storage";
import Signal from "signale";

import {
  formatKcnavMap,
  getAllMapIds,
  getKcnavMap,
  KcnavEnemyShip,
  KcnavMap,
} from "./maps";

const SAVE_OPTIONS: SaveOptions = {
  gzip: true,
  metadata: {
    cacheControl: "public, max-age=60",
  },
};

const uniqByShipId = (ships: KcnavEnemyShip[]): KcnavEnemyShip[] => {
  const record: Record<number, KcnavEnemyShip> = {};

  ships.forEach((ship) => {
    record[ship.id] = ship;
  });

  return Object.values(record);
};

const updateShips = async (maps: KcnavMap[]) => {
  const md = await storage.readJson("data/master_data.json");
  const masterShips = md.ships;

  const findMasterShip = (id: number) =>
    masterShips.find((ship) => ship.ship_id === id);

  const ships = maps
    .sort((a, b) => a.id - b.id)
    .flatMap((map) => Object.values(map.enemycomps))
    .filter(nonNullable)
    .flat()
    .flatMap(({ mainFleet, escortFleet }) => mainFleet.concat(escortFleet));

  uniqByShipId(ships).forEach((kcnavShip) => {
    const masterShip = findMasterShip(kcnavShip.id);
    if (!masterShip) return;

    const signale = Signal.scope(`id:${masterShip.ship_id} ${masterShip.name}`);

    if (!kcnavShip.hp) {
      signale.fatal("hp is None");
      return;
    }

    (
      [
        ["armor", "armor"],
        ["hp", "max_hp"],
        ["torp", "torpedo"],
        ["fp", "firepower"],
        ["aa", "anti_air"],
      ] as const
    ).forEach(([key1, key2]) => {
      const next = kcnavShip[key1] || 0;
      const current = masterShip[key2][0];

      if (next === current) {
        return;
      }

      const n = next || 0;
      masterShip[key2] = [n, n];
      signale.info(`${key2} ${current ?? "null"} -> ${n}`);
    });

    const equips = kcnavShip.equips.filter((eq) => eq > 0);
    if (!equips.every((eq, index) => eq === masterShip.stock[index]?.gear_id)) {
      const s1 = masterShip.stock.map((g) => g.gear_id).toString();
      const s2 = equips.toString();
      signale.info(`equip ${s1} -> ${s2}`);

      masterShip.stock = equips.map((gear_id) => ({ gear_id }));
    }
  });

  const spreadsheet = await getGoogleSpreadsheet();

  await Promise.all([
    storage.mergeMasterData({ ships: masterShips }),
    updateRows(spreadsheet.sheetsByTitle["艦娘"], () => masterShips),
  ]);
};

const updateMaps = async (kcnavMaps: KcnavMap[]) => {
  const promises = kcnavMaps.map((kcnavMap) => {
    const map = formatKcnavMap(kcnavMap);
    return storage.updateJson(`maps/${map.id}.json`, () => map, SAVE_OPTIONS);
  });

  await Promise.all(promises);
};

const HOT_MAPS: number[] = [511, 512, 513];

const updateByKcnav = async () => {
  const ids = await getAllMapIds();
  await storage.updateJson(`maps/all.json`, () => ids, SAVE_OPTIONS);

  const kcnavMaps: KcnavMap[] = [];

  for (const id of ids) {
    if (!HOT_MAPS.includes(id) || (await storage.exists(`maps/${id}.json`))) {
      continue;
    }

    const map = await getKcnavMap(id);
    kcnavMaps.push(map);
  }

  if (kcnavMaps.length > 0) {
    await Promise.all([updateMaps(kcnavMaps), updateShips(kcnavMaps)]);
  }
};

updateByKcnav().catch((err) => console.log(err));
