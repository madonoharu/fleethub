import React from "react"
import styled from "styled-components"
import { EnemyFleetState, NodePlan } from "@fleethub/core"
import { maps, MapData, MapNode } from "@fleethub/data"

import { Button, Paper, Typography, Dialog } from "@material-ui/core"

import { NauticalChart, Select } from "../../../components"
import { useOpen } from "../../../hooks"

import MapEnemyFleetCard from "./MapEnemyFleetCard"
import MapSelect from "./MapSelect"
import MapNodeContent from "./MapNodeContent"

const StyledMapSelect = styled(MapSelect)`
  margin: 8px;
`

const idToKey = (id: number) => `${Math.floor(id / 10)}-${id % 10}`

type Props = {
  onSelect?: (node: NodePlan) => void
}

const MapEnemySelect: React.FC<Props> = ({ onSelect }) => {
  const [mapData, setMapData] = React.useState<MapData>(maps[0])
  const [node, setNode] = React.useState<MapNode>()
  const [diff, setDiff] = React.useState(4)
  const { open, onClose, onOpen } = useOpen()

  const handleMapSelect = (map: MapData) => {
    setMapData(map)
    onClose()
  }

  const handleEnemySelect = (enemy: EnemyFleetState) => {
    if (!node || !onSelect) return
    const { type, point, d } = node
    onSelect({ type, point, d, enemy })
  }

  return (
    <div>
      <Dialog open={open} onClose={onClose}>
        <StyledMapSelect onSelect={handleMapSelect} />
      </Dialog>
      <Button onClick={onOpen} variant="outlined">
        海域 {idToKey(mapData.id)}
      </Button>
      <Select
        options={[4, 3, 2, 1]}
        value={diff}
        onChange={setDiff}
        getOptionLabel={(diff) => ["丁", "丙", "乙", "甲"][diff - 1]}
      />
      <NauticalChart
        data={mapData}
        onClick={(node) => {
          node.enemies && setNode(node)
        }}
      />
      {node && <MapNodeContent node={node} difficulty={diff} onEnemySelect={handleEnemySelect} />}
    </div>
  )
}

export default MapEnemySelect
