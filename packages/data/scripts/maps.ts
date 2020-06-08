import fs from "fs-extra"
import { range, isEqual } from "lodash"

import { getKcnavMapData, KcnavMapData, KcnavNodeType, KcnavEnemyShip, KcnavEnemyFleet } from "./kcnav"
import { MapNode, MapLink, MapEnemyFleet } from "../src"

const formatEnemyShip = (kcnavShip: KcnavEnemyShip) => kcnavShip.id
const formatEnemyFleet = ({ mainFleet, escortFleet }: KcnavEnemyFleet) => {
  const main = mainFleet.map(formatEnemyShip)
  const escort = escortFleet.length ? escortFleet.map(formatEnemyShip) : undefined
  return { main, escort }
}
const formatKcnavEnemies = (kcnavEnemies: KcnavEnemyFleet[]) => {
  const enemies: MapEnemyFleet[] = []

  for (const kcnavFleet of kcnavEnemies) {
    const { formation } = kcnavFleet
    const formatted = formatEnemyFleet(kcnavFleet)
    const found = enemies.find(({ main, escort, difficulty }) => isEqual({ main, escort, difficulty }, formatted))
    if (found) {
      found.formations.push(formation)
    } else {
      enemies.push({ ...formatted, formations: [formation], difficulty: kcnavFleet.diff })
    }
  }

  return enemies
}

const format = ({ id, route, spots, lbasdistance, enemycomps }: KcnavMapData) => {
  const nodes: MapNode[] = []
  for (const [point, [x, y]] of Object.entries(spots)) {
    const edgeEntries = Object.entries(route).filter(([edgeId, [source, target]]) => target === point)
    const type = edgeEntries.length ? edgeEntries[0][1][2] : KcnavNodeType.Unknown

    const edges = edgeEntries.map((entry) => entry[0]).join(",")
    const kcnavEnemies = enemycomps[edges]
    const enemies = kcnavEnemies && formatKcnavEnemies(kcnavEnemies)

    nodes.push({ point, x, y, d: lbasdistance[point], type, enemies })
  }

  const links = Object.values(route)
    .map(([source, target]) => source && { source, target })
    .filter((v): v is MapLink => Boolean(v))

  return { id, nodes, links }
}

type WorldConfig = [number, number, boolean?]

const getKcnavMaps = async (configs: Array<readonly [number, boolean?]>) => {
  const maps: KcnavMapData[] = []
  for (const mapConfig of configs) {
    const kcnavMapData = await getKcnavMapData(...mapConfig)
    maps.push(kcnavMapData)
  }

  return maps
}

export const updateMaps = async () => {
  const configs: WorldConfig[] = [
    [1, 6],
    [2, 5],
    [3, 5],
    [4, 5],
    [5, 5],
    [6, 5],
    [7, 2],
    [45, 3],
    [46, 6],
    [47, 1],
  ]

  const mapConfigs = configs.flatMap(([worldId, length, cache]) =>
    range(length).map((index) => [worldId * 10 + index + 1, cache] as const)
  )

  const kcnavMaps = await getKcnavMaps(mapConfigs)
  fs.writeJSONSync("json/maps.json", kcnavMaps.map(format))
}

updateMaps()
