import React from "react"
import styled from "styled-components"
import { EnemyFleetState, NodePlan } from "@fleethub/core"
import { maps, MapData, MapNode, MapNodeType } from "@fleethub/data"

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
  const [mapId, setMapId] = React.useState(11)
  const [point, setPoint] = React.useState("")
  const [difficulty, setDifficulty] = React.useState(4)

  const map = maps.find((map) => map.id === mapId)
  const node = map?.nodes.find((node) => node.point === point)

  const setNode = (node: MapNode) => setPoint(node.point)

  const setMap = (nextMap: MapData) => {
    setMapId((prevMapId) => {
      if (prevMapId === nextMap.id) return prevMapId

      const boss = nextMap.nodes.find((node) => node.type === MapNodeType.Boss)
      if (boss) setNode(boss)

      return nextMap.id
    })
  }

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

  const mapKey = map ? idToKey(map.id) : "不明"

  const handleMapSelect = (nextMap: MapData) => {
    setMap(nextMap)
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

      {map && <NauticalChart data={map} onClick={handleNodeClick} />}
      {node && <MapNodeContent node={node} difficulty={difficulty} onEnemySelect={handleEnemySelect} />}
    </div>
  )
}

export default MapsContent
