import "dotenv/config";

import { nonNullable } from "@fleethub/utils/src";
import Signal from "signale";

import getGoogleSpreadsheet from "./data/getGoogleSpreadsheet";
import * as storage from "./data/storage";
import { updateRows } from "./data/utils";
import { formatKcnavMap, getAllMapIds, getKcnavMap, KcnavMap } from "./maps";

const updateShips = async (maps: KcnavMap[]) => {
  const masterShips = await storage.readMaster("ships");

  const findMasterShip = (id: number) =>
    masterShips.find((ship) => ship.ship_id === id);

  const ships = maps
    .flatMap((map) => Object.values(map.enemycomps))
    .filter(nonNullable)
    .flat()
    .flatMap(({ mainFleet, escortFleet }) => mainFleet.concat(escortFleet));

  ships.forEach((kcnavShip) => {
    const masterShip = findMasterShip(kcnavShip.id);
    if (!masterShip) return;

    const signale = Signal.scope(masterShip.name);

    const { armor, hp } = kcnavShip;

    (
      [
        ["armor", "armor"],
        ["hp", "max_hp"],
        ["torp", "torpedo"],
        ["fp", "firepower"],
        ["aa", "anti_air"],
      ] as const
    ).forEach(([key1, key2]) => {
      const next = kcnavShip[key1];
      const current = masterShip[key2][0];

      if (next === current) {
        return;
      }

      if (next !== undefined || (armor && hp)) {
        const n = next || 0;
        masterShip[key2] = [n, n];
        signale.info(`${key2} ${current ?? "null"} -> ${n}`);
      }
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
    storage.updateMaster("ships", () => masterShips),
    updateRows(spreadsheet.sheetsByTitle["艦娘"], () => masterShips),
  ]);
};

const updateMaps = async (kcnavMaps: KcnavMap[]) => {
  const promises = kcnavMaps.map((kcnavMap) => {
    const map = formatKcnavMap(kcnavMap);
    return storage.updateJson(`maps/${map.id}.json`, () => map);
  });

  await Promise.all(promises);
};

const HOT_MAPS: number[] = [];

const updateByKcnav = async () => {
  const ids = await getAllMapIds();

  await storage.updateJson(`maps/all.json`, () => ids);

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
