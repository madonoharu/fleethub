import React from "react"
import styled from "styled-components"
import { maps, MapData, MapNode } from "@fleethub/data"

import { Container, Paper, Typography } from "@material-ui/core"

import { NauticalChart, Select, ShipBanner } from "../../../components"

import MapEnemyFleetCard, { EnemyFleetState } from "./MapEnemyFleetCard"

const StyledMapEnemyFleetCard = styled(MapEnemyFleetCard)`
  margin: 8px;
`

const MapNodeStats: React.FC<{ node: MapNode; onEnemySelect?: (enemy: EnemyFleetState) => void }> = ({
  node,
  onEnemySelect,
}) => {
  const { point, enemies } = node

  return (
    <>
      <Typography>{node.point}</Typography>
      {enemies?.map((enemyFleet, index) => (
        <StyledMapEnemyFleetCard
          key={index}
          enemyFleet={enemyFleet}
          visibleAlbPower={node.d !== undefined}
          onSelect={onEnemySelect}
        />
      ))}
    </>
  )
}

type Props = {
  onSelect?: (enemy: EnemyFleetState) => void
}

const MapEnemySelect: React.FC<Props> = ({ onSelect }) => {
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
      {node && <MapNodeStats node={node} onEnemySelect={onSelect} />}
    </>
  )
}

export default MapEnemySelect
