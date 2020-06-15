import React from "react"
import styled from "styled-components"
import { EnemyFleetState } from "@fleethub/core"
import { maps, MapData, MapNode } from "@fleethub/data"

import { Button, Paper, Typography, Dialog } from "@material-ui/core"

import { NauticalChart, Select } from "../../../components"

import MapEnemyFleetCard from "./MapEnemyFleetCard"

const StyledMapEnemyFleetCard = styled(MapEnemyFleetCard)`
  margin: 8px;
`

type Props = {
  node: MapNode
  difficulty?: number
  onEnemySelect?: (enemy: EnemyFleetState) => void
}

const MapNodeContent: React.FCX<Props> = ({ className, node, difficulty, onEnemySelect }) => {
  const { point, enemies } = node

  return (
    <div className={className}>
      <Typography>{node.point}</Typography>
      {enemies
        ?.filter((enemy) => !difficulty || !enemy.difficulty || enemy.difficulty === difficulty)
        .map((mapEnemyFleet, index) => (
          <StyledMapEnemyFleetCard
            key={index}
            mapEnemyFleet={mapEnemyFleet}
            visibleAlbFp={node.d !== undefined}
            onSelect={onEnemySelect}
          />
        ))}
    </div>
  )
}

export default MapNodeContent
