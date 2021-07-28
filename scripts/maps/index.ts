import isEqual from "lodash/isEqual";

import { KcnavEnemyFleet, KcnavEnemyShip, KcnavMap } from "./kcnav";

export * from "./kcnav";

export enum MapNodeType {
  Unknown = -1,
  Start = 0,
  Resource = 2,
  Maelstrom = 3,
  Normal = 4,
  Boss = 5,
  Transport = 6,
  Aerial = 7,
  Bounty = 8,
  AerialReconnaissance = 9,
  AirDefense = 10,
  NightBattle = 11,
  LongRangeRadarAmbush = 13,
  EmergencyAnchorageRepair = 14,

  NoEnemy = 90,
  Selector = 91,
}

type MapEnemyShip = number;

export type MapEnemyFleet = {
  main: MapEnemyShip[];
  escort?: MapEnemyShip[];
  formations: number[];
  diff?: number;
};

export type MapNode = {
  point: string;
  x: number;
  y: number;
  type: number;
  d?: number;
  enemies?: MapEnemyFleet[];
};

export type MapLink = [string, string];

export type MapData = {
  id: number;
  nodes: MapNode[];
  links: MapLink[];
};

const formatEnemyShip = (kcnavShip: KcnavEnemyShip) => kcnavShip.id;
const formatEnemyFleet = ({
  mainFleet,
  escortFleet,
  diff,
}: KcnavEnemyFleet) => {
  const main = mainFleet.map(formatEnemyShip);
  const escort = escortFleet.length
    ? escortFleet.map(formatEnemyShip)
    : undefined;
  return { main, escort, diff };
};
const formatKcnavEnemies = (kcnavEnemies: KcnavEnemyFleet[]) => {
  const enemies: MapEnemyFleet[] = [];

  for (const kcnavFleet of kcnavEnemies) {
    const { formation } = kcnavFleet;
    const formatted = formatEnemyFleet(kcnavFleet);
    const found = enemies.find(({ main, escort, diff }) =>
      isEqual({ main, escort, diff }, formatted)
    );
    if (found) {
      found.formations.push(formation);
    } else {
      enemies.push({ ...formatted, formations: [formation] });
    }
  }

  return enemies;
};

export const isBattleNode = (type: MapNodeType) => {
  switch (type) {
    case MapNodeType.Normal:
    case MapNodeType.Boss:
    case MapNodeType.Aerial:
    case MapNodeType.AirDefense:
    case MapNodeType.NightBattle:
    case MapNodeType.LongRangeRadarAmbush:
      return true;
  }
  return false;
};

export const formatKcnavMap = ({
  id,
  route,
  spots,
  lbasdistance,
  enemycomps,
}: KcnavMap) => {
  const nodes: MapNode[] = Object.entries(spots).map(([point, [x, y]]) => {
    const edgeEntries = Object.entries(route).filter(
      (entry) => entry[1][1] === point
    );
    const type = edgeEntries.length
      ? edgeEntries[0][1][2]
      : MapNodeType.Unknown;

    const edges = edgeEntries.map((entry) => entry[0]).join(",");
    const kcnavEnemies = enemycomps[edges];
    const enemies = isBattleNode(type)
      ? kcnavEnemies && formatKcnavEnemies(kcnavEnemies)
      : undefined;

    return {
      point,
      x,
      y,
      d: lbasdistance[point],
      type,
      enemies,
    };
  });

  const links = Object.values(route)
    .map(([source, target]) => source && [source, target])
    .filter((v): v is MapLink => Boolean(v));

  return { id, nodes, links };
};
