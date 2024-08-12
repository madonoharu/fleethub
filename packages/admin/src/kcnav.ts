import { MapNodeType } from "@fh/utils";
import ky, { KyInstance, Options } from "ky";

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
  event: KcnavNodeEvent,
];

type KcnavSpot = [x: number, y: number, start: "Start" | null];

interface KcnavGraph {
  route: Record<number, KcnavEdge>;
  spots: Record<string, KcnavSpot>;
}

interface KcnavLbasdistance {
  [key: string]: { unlockedEdges: number; distance: number }[] | undefined;
}

export interface KcnavEnemyShip {
  id: number;
  name: string;
  name_en: string;
  lvl: number;
  hp?: number;
  fp?: number;
  torp?: number;
  aa?: number;
  armor?: number;
  equips: [number, number, number, number, number];
}

export interface KcnavEnemyComp {
  map: string;
  node: "A";
  mainFleet: KcnavEnemyShip[];
  escortFleet: KcnavEnemyShip[];
  formation: number;
  count: number;
  airpower: [number, number, number, number];
  lbasAirpower: [number, number, number, number];
  uncertainAirpowerItems?: unknown[];
  difficulty?: number;
}

export interface KcnavEnemycomps {
  entryCount?: number;
  entries: KcnavEnemyComp[];
}

export interface KcnavNode {
  point: string;
  type: MapNodeType;
  enemycomps: KcnavEnemycomps;
  x: number;
  y: number;
  d?: number[];
}

export interface KcnavMap {
  id: number;
  graph: KcnavGraph;
  lbasdistance: KcnavLbasdistance;
  enemycomps: KcnavEnemycomps;
}

function getKey(id: number): string {
  return `${Math.floor(id / 10)}-${id % 10}`;
}

export class KcnavClient {
  private client: KyInstance;

  constructor(
    private currentEventId: number | null,
    private cache?: Map<unknown, unknown>,
  ) {
    this.client = ky.extend({
      prefixUrl: `https://tsunkit.net/api/routing/maps`,
    });
  }

  private async get<T>(url: string, options?: Options): Promise<T> {
    const cached = this.cache?.get(url);
    if (cached) {
      console.log(url, "cached");
      return cached as T;
    }

    const { result } = await this.client
      .get(url, options)
      .json<{ result: T }>();

    this.cache?.set(url, result);

    return result;
  }

  async all(): Promise<number[]> {
    const res = await this.client.get("all").json<{
      result: string[];
    }>();

    return res.result.map((key) => Number(key.replace("-", "")));
  }

  getGraph(id: number): Promise<KcnavGraph> {
    const key = getKey(id);
    return this.get<KcnavGraph>(key);
  }

  getLbasdistance(id: number): Promise<KcnavLbasdistance> {
    const key = getKey(id);
    return this.get<KcnavLbasdistance>(`${key}/lbasdistance`);
  }

  getEnemycomps(id: number): Promise<KcnavEnemycomps> {
    const key = getKey(id);
    const KCNAV_TOKEN = process.env["KCNAV_TOKEN"];

    if (!KCNAV_TOKEN) {
      throw new Error("Token not found");
    }

    const isActive = Math.floor(id / 10) === this.currentEventId;
    const url = `${key}/nodes/all/enemycomps`;

    if (isActive) {
      this.cache?.delete(url);
    }

    return this.get<KcnavEnemycomps>(url, {
      headers: {
        Authorization: `Bearer ${KCNAV_TOKEN}`,
      },
    });
  }

  getMap = async (id: number): Promise<KcnavMap> => {
    const [graph, lbasdistance, enemycomps] = await Promise.all([
      this.getGraph(id),
      this.getLbasdistance(id),
      this.getEnemycomps(id),
    ]);

    return {
      id,
      graph,
      lbasdistance,
      enemycomps,
    };
  };
}
