import {
  FhMap,
  MapEnemyFleet,
  MapLink,
  MapNode,
  MapNodeType,
} from "@fleethub/utils/src";
import isMatch from "lodash/isMatch";

import { KcnavEnemyFleet, KcnavEnemyShip, KcnavMap } from "./kcnav";

export * from "./kcnav";

const formatEnemyShip = (kcnavShip: KcnavEnemyShip) => kcnavShip.id;

const formatEnemyFleet = ({
  mainFleet,
  escortFleet,
  formation,
  diff,
  airpower,
  lbasAirpower,
}: KcnavEnemyFleet): MapEnemyFleet => {
  const main = mainFleet.map(formatEnemyShip);
  const escort = escortFleet.length
    ? escortFleet.map(formatEnemyShip)
    : undefined;

  const formations = [formation];

  return {
    main,
    escort,
    formations,
    diff,
    fp: airpower,
    lbasFp: lbasAirpower,
  };
};

const formatKcnavEnemies = (kcnavEnemies: KcnavEnemyFleet[]) => {
  const enemies: MapEnemyFleet[] = [];

  kcnavEnemies.forEach((kcnavFleet) => {
    const { formation } = kcnavFleet;
    const formatted = formatEnemyFleet(kcnavFleet);
    const found = enemies.find(({ main, escort, diff }) =>
      isMatch(formatted, { main, escort, diff })
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
}: KcnavMap): FhMap => {
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
