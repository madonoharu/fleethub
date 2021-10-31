import { Dict, MapNodeType } from "@fh/utils/src";
import fs from "fs-extra";
import got from "got";
import moment from "moment";
import Signale from "signale";

const instance = got.extend({
  prefixUrl: "https://tsunkit.net/api/routing",
  timeout: 1000 * 60 * 3,
  retry: 5,
});

type KcnavParams = Partial<{
  map: string;
  minDiff: number;
  maxDiff: number;
  maxGauge: number;
  minGaugeLevel: number;
  maxGaugeLevel: number;
  minEdges: number;
  maxEdges: number;
  minLos: number;
  maxLos: number;
  minRadars: number;
  maxRadars: number;
  minRadarShips: number;
  maxRadarShips: number;
  minSpeed: number;
  maxSpeed: number;
  nodes: string;
  edges: string;
  fleetType: number;
  losType: number;
  radarType: number;
  difficulty: number;
  showEdgeIds: boolean;
  showLbasDistance: boolean;
  showMapBackground: boolean;
  retreats: boolean;
  cleared: number;
  mainComp: string;
  useMainFs: boolean;
  escortComp: string;
  useEscortFs: boolean;
  allComp: string;
  start: string;
}>;

type MapKey = string;

enum KcnavNodeEvent {
  Unknown = -1,
  Start = 0,
  Resource = 2,
  Maelstrom = 3,
  Normal = 4,
  Boss = 5,
  Avoided = 6,
  Aerial = 7,
  Bounty = 8,
  Transport = 9,
  EmergencyAnchorageRepair = 10,
}

type KcnavEdge = [
  source: MapKey | null,
  target: MapKey,
  type: MapNodeType,
  event: KcnavNodeEvent
];

type KcnavSpot = [number, number, "Start" | null];

type KcnavGraph = {
  route: Record<number, KcnavEdge>;
  spots: Record<string, KcnavSpot>;
};

type KcnavNodesummary = Dict<string, { runs: number }>;

type KcnavLbasdistance = Dict<
  string,
  { unlockedEdges: number; distance: number }[]
>;

export type KcnavEnemyShip = {
  id: number;
  lvl: number;
  hp?: number;
  fp?: number;
  torp?: number;
  armor?: number;
  aa?: number;
  equips: [number, number, number, number, number];
};

export type KcnavEnemyFleet = {
  mainFleet: KcnavEnemyShip[];
  escortFleet: KcnavEnemyShip[];
  formation: number;
  count: number;
  airpower: [number, number, number, number];
  lbasAirpower: [number, number, number, number];
  diff?: number;
};

type KcnavEnemycomps = {
  entryCount?: number;
  entries: KcnavEnemyFleet[];
};

export type KcnavMap = KcnavGraph & {
  id: number;
  nodesummary: KcnavNodesummary;
  lbasdistance: KcnavLbasdistance;
  enemycomps: Dict<string, KcnavEnemyFleet[]>;
};

const start = (duration = 0) =>
  moment().add(duration, "d").format("YYYY-MM-DD");

class KcnavMapClient {
  constructor(public id: number) {}

  get worldId() {
    return Math.floor(this.id / 10);
  }

  get areaId() {
    return this.id % 10;
  }

  get key() {
    return `${this.worldId}-${this.areaId}`;
  }

  get isEvent() {
    return this.worldId > 10;
  }

  public getNodesummary = () =>
    instance(`nodesummary/${this.key}`, {
      searchParams: { start: start(-10) },
    })
      .json<{ result: KcnavNodesummary }>()
      .then((res) => res.result);

  public getGraph = () => instance(`maps/${this.key}`).json<KcnavGraph>();

  public getLbasdistance = () =>
    instance(`lbasdistance/${this.key}`)
      .json<{ result: KcnavLbasdistance }>()
      .then((res) => res.result);

  private getEnemycomps = async (
    edges: string,
    count: number,
    diff?: number
  ): Promise<KcnavEnemyFleet[]> => {
    if (this.isEvent && !diff) {
      const enemycomps: KcnavEnemyFleet[] = [];
      for (const diff of [1, 2, 3, 4]) {
        enemycomps.push(...(await this.getEnemycomps(edges, count, diff)));
      }

      return enemycomps;
    }

    const params: KcnavParams = {
      map: this.key,
      minDiff: diff,
      maxDiff: diff,
      edges,
      start: "2018-01-01",
    };

    if (count > 100) {
      params.start = start(-360);
    }
    if (count > 1000) {
      params.start = start(-60);
    }
    if (count > 5000) {
      params.start = start(-20);
    }
    if (count > 10000) {
      params.start = start(-10);
    }

    const { entries } = await instance("enemycomps", {
      searchParams: params,
    }).json<KcnavEnemycomps>();

    if (diff) {
      entries.forEach((enemy) => {
        enemy.diff = diff;
      });
    }

    return entries;
  };

  public get = async (): Promise<KcnavMap> => {
    const { route, spots } = await this.getGraph();
    const nodesummary = await this.getNodesummary();
    const lbasdistance = await this.getLbasdistance();

    const enemycomps: KcnavMap["enemycomps"] = {};

    for (const name of Object.keys(spots)) {
      const signale = Signale.scope(`${this.key} ${name}`);
      signale.await();

      const edgeIds = Object.entries(route)
        .filter((entry) => entry[1][1] === name)
        .map(([edgeId]) => edgeId);

      const count = edgeIds.reduce(
        (c, id) => c + (nodesummary[id]?.runs || 0),
        0
      );
      const edges = edgeIds.join(",");

      enemycomps[edges] = await this.getEnemycomps(edges, count);
      signale.success();
    }

    return {
      id: this.id,
      nodesummary,
      lbasdistance,
      route,
      spots,
      enemycomps,
    };
  };
}

const readCachedMap = (id: number): KcnavMap | undefined => {
  if (fs.existsSync(".cache/kcnav")) {
    const data: Record<string, KcnavMap | undefined> =
      fs.readJSONSync(".cache/kcnav");
    return data[id];
  }

  return;
};

const writeCachedMap = (mapData: KcnavMap) => {
  let data: Record<string, KcnavMap>;

  if (fs.existsSync(".cache/kcnav")) {
    data = fs.readJSONSync(".cache/kcnav");
  } else {
    data = {};
  }

  data[mapData.id] = mapData;
  fs.outputJsonSync(".cache/kcnav", data);
};

export const getKcnavMap = async (id: number, cache = true) => {
  const mapClient = new KcnavMapClient(id);

  if (cache) {
    const cachedMap = readCachedMap(id);

    if (cachedMap) {
      Signale.scope(mapClient.key).info("cached");
      return cachedMap;
    }
  }

  const map = await mapClient.get();

  if (cache) {
    writeCachedMap(map);
  }

  return map;
};

export const getAllMapIds = () =>
  instance(`maps/all`)
    .json<string[]>()
    .then((all) => all.map((str) => Number(str.replace("-", ""))));
