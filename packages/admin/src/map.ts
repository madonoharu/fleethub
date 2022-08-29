import {
  nonNullable,
  FhMap,
  MapEnemyComp,
  MapNode,
  MapNodeType,
} from "@fh/utils";
import isEqual from "lodash/isEqual";

import {
  KcnavClient,
  KcnavEnemyComp,
  KcnavEnemycomps,
  KcnavEnemyShip,
  KcnavMap,
} from "./kcnav";
import { MasterDataSpreadsheet } from "./spreadsheet";
import * as storage from "./storage";

function getFp(
  kcnavAirpower: [number, number, number, number]
): [number, number, number, number] {
  const fp = kcnavAirpower[3] / 3;

  if (!fp) return [0, 0, 0, 0];

  return [
    Math.floor((1 / 3) * fp) + 1,
    Math.floor((2 / 3) * fp) + 1,
    Math.ceil(1.5 * fp),
    kcnavAirpower[3],
  ];
}

function getEnemyComp({
  mainFleet,
  escortFleet,
  formation,
  difficulty,
  airpower,
  lbasAirpower,
}: KcnavEnemyComp): MapEnemyComp {
  const main = mainFleet.map((ship) => ship.id);
  const escort = escortFleet.length
    ? escortFleet.map((ship) => ship.id)
    : undefined;

  const formations = [formation];

  return {
    main,
    escort,
    formations,
    diff: difficulty,
    fp: getFp(airpower),
    lbasFp: getFp(lbasAirpower),
  };
}

function getEnemies(
  enemycomps: KcnavEnemycomps,
  point: string
): MapEnemyComp[] {
  const enemies: MapEnemyComp[] = [];

  enemycomps.entries
    .filter((comp) => comp.node == point)
    .forEach((comp) => {
      const { formation } = comp;
      const formatted = getEnemyComp(comp);
      const found = enemies.find(
        ({ main, escort, diff }) =>
          isEqual(formatted.main, main) &&
          isEqual(formatted.escort, escort) &&
          formatted.diff === diff
      );

      if (found?.formations.includes(formation)) {
        return;
      }

      if (found) {
        found.formations.push(formation);
      } else {
        enemies.push(formatted);
      }
    });

  enemies.forEach((enemy) => enemy.formations.sort());

  return enemies;
}

function createFhMap({ id, graph, lbasdistance, enemycomps }: KcnavMap): FhMap {
  const links = Object.values(graph.route)
    .map(([source, target]): [string, string] | null =>
      source ? [source, target] : null
    )
    .filter(nonNullable);

  const nodes = Object.entries(graph.spots).map(([point, [x, y]]): MapNode => {
    const edgeEntries = Object.entries(graph.route).filter(
      (entry) => entry[1][1] === point
    );
    const type = edgeEntries.length
      ? edgeEntries[0][1][2]
      : MapNodeType.Unknown;

    return {
      point,
      type,
      x,
      y,
      d: lbasdistance[point]?.map((a) => a.distance),
      enemies: getEnemies(enemycomps, point),
    };
  });

  return {
    id,
    nodes,
    links,
  };
}

function uniqById(ships: KcnavEnemyShip[]): KcnavEnemyShip[] {
  const record: Record<number, KcnavEnemyShip> = {};

  ships.forEach((ship) => {
    record[ship.id] = ship;
  });

  return Object.values(record);
}

async function updateShips(maps: KcnavMap[]): Promise<void> {
  const spreadsheet = new MasterDataSpreadsheet();
  const [md, table] = await Promise.all([
    storage.readMasterData(),
    spreadsheet.readTable("ships"),
  ]);

  const masterShips = md.ships;

  const findMasterShip = (id: number) =>
    masterShips.find((ship) => ship.ship_id === id);

  const ships = maps
    .sort((a, b) => a.id - b.id)
    .flatMap((map) => map.enemycomps.entries)
    .flatMap(({ mainFleet, escortFleet }) => mainFleet.concat(escortFleet));

  uniqById(ships).forEach((kcnavShip) => {
    const masterShip = findMasterShip(kcnavShip.id);
    if (!masterShip) return;

    const label = `[id:${masterShip.ship_id} ${masterShip.name}]`;

    if (!kcnavShip.hp) {
      console.warn(label, "hp is None");
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
      console.log(label, `${key2} ${current ?? "null"} -> ${n}`);
    });

    const equips = kcnavShip.equips.filter((eq) => eq > 0);
    if (!equips.every((eq, index) => eq === masterShip.stock[index]?.gear_id)) {
      const s1 = masterShip.stock.map((g) => g.gear_id).toString();
      const s2 = equips.toString();
      console.log(label, `gears ${s1} -> ${s2}`);

      masterShip.stock = equips.map((gear_id) => ({ gear_id }));
    }
  });

  await Promise.all([
    storage.mergeMasterData(md, { ships: masterShips }),
    spreadsheet.updateTable(table, masterShips),
  ]);
}

async function updateMaps(kcnavMaps: KcnavMap[]): Promise<void> {
  const promises = kcnavMaps.map((kcnavMap) => {
    const map = createFhMap(kcnavMap);

    return storage.updateJson(`data/maps/${map.id}.json`, () => map, {
      public: true,
      immutable: true,
    });
  });

  await Promise.all(promises);
}

export async function updateByKcnav(
  currentEventId: number | null,
  cache?: Map<string, unknown>
): Promise<void> {
  const client = new KcnavClient(currentEventId, cache);
  const ids = await client.all();
  const kcnavMaps: KcnavMap[] = [];

  for (const id of ids) {
    const exists = await storage.exists(`data/maps/${id}.json`);
    const isCurrentEventMap = Math.floor(id / 10) === currentEventId;

    if (!exists || isCurrentEventMap) {
      const map = await client.getMap(id);
      kcnavMaps.push(map);
    }
  }

  if (kcnavMaps.length > 0) {
    await Promise.all([updateMaps(kcnavMaps), updateShips(kcnavMaps)]);
  }
}
