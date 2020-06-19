import React from "react"
import styled from "styled-components"
import { EnemyFleetState } from "@fleethub/core"
import { maps, MapData, MapNode } from "@fleethub/data"

import { Button, Paper, Typography, Dialog } from "@material-ui/core"

import { NauticalChart, Select } from "../../../components"

import MapEnemyFleetCard from "./MapEnemyFleetCard"
import { NodeLable } from "../../organisms/NauticalChart"

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
      <NodeLable node={node} />
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
