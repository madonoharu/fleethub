import React from "react"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { EnemyFleetState, NodePlan } from "@fleethub/core"
import { maps, MapData, MapNode, MapNodeType } from "@fleethub/data"

import { Button } from "@material-ui/core"

import { NauticalChart, Select } from "../.."
import { useModal } from "../../../hooks"
import { uiSlice } from "../../../store"

import MapSelect from "./MapSelect"
import MapNodeContent from "./MapNodeContent"

const StyledMapSelect = styled(MapSelect)`
  margin: 8px;
`

const getMapKey = (id: number) => `${Math.floor(id / 10)}-${id % 10}`

const useMapListState = () => {
  const { mapId, point, difficulty } = useSelector((state) => state.ui.mapList)
  const dispatch = useDispatch()

  const map = maps.find((map) => map.id === mapId)
  const node = map?.nodes.find((node) => node.point === point)

  const setNode = ({ point }: MapNode) => dispatch(uiSlice.actions.updateMap({ point }))

  const setMap = (nextMap: MapData) => {
    if (mapId === nextMap.id) return

    const boss = nextMap.nodes.find((node) => node.type === MapNodeType.Boss)
    if (boss) setNode(boss)

    dispatch(uiSlice.actions.updateMap({ mapId: nextMap.id, point: boss?.point }))
  }

  const setDifficulty = (difficulty: number) => uiSlice.actions.updateMap({ difficulty })

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

const MapList: React.FC<Props> = ({ onSelectNodePlan }) => {
  const { map, setMap, node, setNode, difficulty, setDifficulty } = useMapListState()

  const Modal = useModal()

  const mapKey = map ? getMapKey(map.id) : "不明"

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

export default MapList
