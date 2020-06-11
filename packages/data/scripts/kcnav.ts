import fs from "fs-extra"
import Axios from "axios"
import Signale, { await } from "signale"
import { sum } from "lodash"
import moment from "moment"
import { Dict } from "@fleethub/utils/esm"

const client = Axios.create({ baseURL: "http://kc.piro.moe/api/routing" })

type KcnavParams = Partial<{
  maxGauge: number
  minGaugeLevel: number
  maxGaugeLevel: number
  minEdges: number
  maxEdges: number
  minLos: number
  maxLos: number
  minRadars: number
  maxRadars: number
  minRadarShips: number
  maxRadarShips: number
  minSpeed: number
  maxSpeed: number
  nodes: string
  edges: string
  fleetType: number
  losType: number
  radarType: number
  difficulty: number
  showEdgeIds: boolean
  showLbasDistance: boolean
  showMapBackground: boolean
  retreats: boolean
  cleared: number
  mainComp: string
  useMainFs: boolean
  escortComp: string
  useEscortFs: boolean
  allComp: string
  start: string
}>

type MapKey = string

export enum KcnavNodeType {
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

type KcnavEdge = [MapKey | null, MapKey, KcnavNodeType, KcnavNodeEvent]
type KcnavSpot = [number, number, "Start" | null]

type KcnavGraph = {
  route: Record<number, KcnavEdge>
  spots: Record<string, KcnavSpot>
}

type KcnavHeatmaps = Record<string, number>

type KcnavLbasdistance = Record<string, number>

export type KcnavEnemyShip = {
  id: number
  lvl: number
  hp?: number
  fp?: number
  torp?: number
  armor?: number
  equips: [number, number, number, number, number]
}

export type KcnavEnemyFleet = {
  mainFleet: KcnavEnemyShip[]
  escortFleet: KcnavEnemyShip[]
  formation: number
  count: number
  diff?: number
}

type KcnavEnemycomps = { entryCount?: number; entries: KcnavEnemyFleet[] }

export type KcnavMapData = KcnavGraph & {
  id: number
  lbasdistance: KcnavLbasdistance
  heatmaps: KcnavHeatmaps
  enemycomps: Dict<string, KcnavEnemyFleet[]>
}

export const isBattleNode = (type: KcnavNodeType) => {
  switch (type) {
    case KcnavNodeType.Normal:
    case KcnavNodeType.Boss:
    case KcnavNodeType.Aerial:
    case KcnavNodeType.AirDefense:
    case KcnavNodeType.NightBattle:
    case KcnavNodeType.LongRangeRadarAmbush:
      return true
  }
  return false
}

const getStart = (duration = 0) => moment().add(duration, "d").format("YYYY-MM-DD")

class KcnavMapClient {
  constructor(public id: number) {}

  get worldId() {
    return Math.floor(this.id / 10)
  }

  get areaId() {
    return this.id % 10
  }

  get key() {
    return `${this.worldId}-${this.areaId}`
  }

  get isEvent() {
    return this.worldId > 10
  }

  public getHeatmaps = () =>
    client
      .get<{ result: KcnavHeatmaps }>(`/heatmaps/${this.key}`, { params: { start: getStart(-10) } })
      .then((res) => res.data.result)

  public getGraph = () => client.get<KcnavGraph>(`/maps/${this.key}`).then((res) => res.data)

  public getLbasdistance = () =>
    client.get<{ result: KcnavLbasdistance }>(`/lbasdistance/${this.key}`).then((res) => res.data.result)

  private getEnemycomps = async (edges: string, count: number, diff?: number): Promise<KcnavEnemyFleet[]> => {
    if (this.isEvent && !diff) {
      const enemycomps: KcnavEnemyFleet[] = []
      for (const diff of [1, 2, 3, 4]) {
        enemycomps.push(...(await this.getEnemycomps(edges, count, diff)))
      }

      return enemycomps
    }

    const params = {
      map: this.key,
      minDiff: diff,
      maxDiff: diff,
      edges,
      start: "2018-01-01",
    }

    if (count > 100) {
      params.start = getStart(-360)
    }
    if (count > 1000) {
      params.start = getStart(-60)
    }
    if (count > 5000) {
      params.start = getStart(-20)
    }
    if (count > 10000) {
      params.start = getStart(-10)
    }

    const enemies = await client
      .get<KcnavEnemycomps>("/enemycomps", { params })
      .then((res) => res.data.entries)

    if (diff) {
      enemies.forEach((enemy) => {
        enemy.diff = diff
      })
    }

    return enemies
  }

  public get = async (): Promise<KcnavMapData> => {
    const { route, spots } = await this.getGraph()
    const lbasdistance = await this.getLbasdistance()
    const heatmaps = await this.getHeatmaps()

    const enemycomps: KcnavMapData["enemycomps"] = {}
    for (const name of Object.keys(spots)) {
      const signale = Signale.scope(`${this.key} ${name}`)
      signale.await()

      const edgeIds = Object.entries(route)
        .filter(([edgeId, [source, target]]) => target === name)
        .map(([edgeId]) => edgeId)

      const count = sum(edgeIds.map((id) => heatmaps[id]))
      const edges = edgeIds.join(",")

      enemycomps[edges] = await this.getEnemycomps(edges, count)
      signale.success()
    }

    return { id: this.id, route, spots, lbasdistance, heatmaps, enemycomps }
  }
}

const readCachedMapData = (id: number): KcnavMapData | undefined => {
  try {
    const maps: KcnavMapData[] = fs.readJSONSync(".cache/kcnav")
    return maps.find((data) => data.id === id)
  } catch {
    return
  }
}

const writeCachedMapData = (mapData: KcnavMapData) => {
  try {
    const maps: KcnavMapData[] = fs.readJSONSync(".cache/kcnav")
    const filtered = maps.filter((map) => map.id !== mapData.id)
    filtered.push(mapData)
    fs.writeJSONSync(".cache/kcnav", filtered)
  } catch {
    fs.ensureDirSync(".cache")
    fs.writeJSONSync(".cache/kcnav", [mapData])
  }
}

export const getKcnavMapData = async (id: number, cache = true) => {
  const mapClient = new KcnavMapClient(id)

  if (cache) {
    const cachedMapData = readCachedMapData(id)

    if (cachedMapData) {
      Signale.scope(mapClient.key).info("cached")
      return cachedMapData
    }
  }

  const mapData = await mapClient.get()
  writeCachedMapData(mapData)
  return mapData
}
