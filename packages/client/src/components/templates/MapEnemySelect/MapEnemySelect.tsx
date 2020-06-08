import React from "react"
import styled from "styled-components"
import { maps, MapData, MapNode } from "@fleethub/data"

import { Container, Paper, Typography } from "@material-ui/core"

import { NauticalChart, Select, ShipBanner } from "../../../components"

import MapEnemyFleetCard from "./MapEnemyFleetCard"

const StyledMapEnemyFleetCard = styled(MapEnemyFleetCard)`
  margin: 8px;
`

const MapNodeEnemyList: React.FC<{ node: MapNode }> = ({ node }) => {
  const { enemies } = node

  if (!enemies) return null

  return (
    <>
      {enemies.map((enemyFleet, index) => (
        <StyledMapEnemyFleetCard key={index} enemyFleet={enemyFleet} />
      ))}
    </>
  )
}

const MapEnemySelect: React.FC = () => {
  const [mapData, setMapData] = React.useState<MapData>(maps[0])
  const [node, setNode] = React.useState<MapNode>()
  return (
    <>
      <Select options={maps} value={mapData} onChange={setMapData} getOptionLabel={({ id }) => id} />
      <NauticalChart
        data={mapData}
        onClick={(node) => {
          node.enemies && setNode(node)
        }}
      />
      {node && <Typography>{node.point}</Typography>}
      {node && <MapNodeEnemyList node={node} />}
    </>
  )
}

export default MapEnemySelect
