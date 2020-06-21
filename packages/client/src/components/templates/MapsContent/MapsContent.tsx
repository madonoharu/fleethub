import React from "react"
import styled from "styled-components"
import { EnemyFleetState, NodePlan } from "@fleethub/core"
import { maps, MapData, MapNode } from "@fleethub/data"

import { Button } from "@material-ui/core"

import { NauticalChart, Select } from "../../../components"
import { useModal } from "../../../hooks"

import MapSelect from "./MapSelect"
import MapNodeContent from "./MapNodeContent"

const StyledMapSelect = styled(MapSelect)`
  margin: 8px;
`

const idToKey = (id: number) => `${Math.floor(id / 10)}-${id % 10}`

const useMapsContentState = () => {
  const [map, setMap] = React.useState<MapData>(maps[0])
  const [node, setNode] = React.useState<MapNode>()
  const [difficulty, setDifficulty] = React.useState(4)

  return {
    map,
    setMap,
    node,
    setNode,
    difficulty,
    setDifficulty,
  }
}

type Props = {
  onSelectNodePlan?: (node: NodePlan) => void
}

const MapsContent: React.FC<Props> = ({ onSelectNodePlan }) => {
  const { map, setMap, node, setNode, difficulty, setDifficulty } = useMapsContentState()

  const Modal = useModal()

  const mapKey = idToKey(map.id)

  const handleMapSelect = (nextMap: MapData) => {
    if (nextMap !== map) {
      setMap(nextMap)
      setNode(undefined)
    }
    Modal.hide()
  }

  const handleEnemySelect = (enemy: EnemyFleetState) => {
    if (!node || !onSelectNodePlan) return
    const { type, point, d } = node
    const name = `${mapKey} ${point}`
    onSelectNodePlan({ type, point, d, name, enemy })
  }

  const handleNodeClick = (node: MapNode) => {
    if (!node.enemies) return
    setNode(node)
  }

  return (
    <div>
      <Modal>
        <StyledMapSelect onSelect={handleMapSelect} />
      </Modal>

      <Button onClick={Modal.show} variant="outlined">
        海域 {mapKey}
      </Button>
      <Select
        options={[4, 3, 2, 1]}
        value={difficulty}
        onChange={setDifficulty}
        getOptionLabel={(diff) => ["丁", "丙", "乙", "甲"][diff - 1]}
      />
      <NauticalChart data={map} onClick={handleNodeClick} />
      {node && <MapNodeContent node={node} difficulty={difficulty} onEnemySelect={handleEnemySelect} />}
    </div>
  )
}

export default MapsContent
