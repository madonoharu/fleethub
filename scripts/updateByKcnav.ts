import "dotenv/config";

import { storage, Sheet } from "@fh/admin/src";
import { nonNullable } from "@fh/utils/src";
import Signal from "signale";

import {
  formatKcnavMap,
  getAllMapIds,
  getKcnavMap,
  KcnavEnemyShip,
  KcnavMap,
} from "./maps";

const uniqByShipId = (ships: KcnavEnemyShip[]): KcnavEnemyShip[] => {
  const record: Record<number, KcnavEnemyShip> = {};

  ships.forEach((ship) => {
    record[ship.id] = ship;
  });

  return Object.values(record);
};

const updateShips = async (maps: KcnavMap[]) => {
  const [md, sheet] = await Promise.all([
    storage.readJson("data/master_data.json"),
    Sheet.readByKey("ships"),
  ]);

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

  await Promise.all([
    storage.mergeMasterData(md, { ships: masterShips }),
    sheet.write(masterShips),
  ]);
};

const updateMaps = async (kcnavMaps: KcnavMap[]) => {
  const promises = kcnavMaps.map((kcnavMap) => {
    const map = formatKcnavMap(kcnavMap);

    return storage.updateJson(`maps/${map.id}.json`, () => map, {
      public: true,
      immutable: true,
    });
  });

  await Promise.all(promises);
};

const HOT_MAPS: number[] = [521];

const updateByKcnav = async () => {
  const ids = await getAllMapIds();
  const kcnavMaps: KcnavMap[] = [];

  for (const id of ids) {
    if (!HOT_MAPS.includes(id) && (await storage.exists(`maps/${id}.json`))) {
      continue;
    }

    const map = await getKcnavMap(id);
    kcnavMaps.push(map);
  }

  if (kcnavMaps.length > 0) {
    await Promise.all([updateMaps(kcnavMaps), updateShips(kcnavMaps)]);
  }

  const entries = await Promise.all(
    ids.map(async (id) => {
      const metadata = await storage.getMetadata(`maps/${id}.json`);
      const generation = metadata["generation"] as string;
      return [id, generation] as const;
    })
  );

  await storage.writeJson(`maps/all.json`, Object.fromEntries(entries), {
    public: true,
    metadata: {
      cacheControl: "public, max-age=60",
    },
  });
};

updateByKcnav().catch((err) => console.log(err));
