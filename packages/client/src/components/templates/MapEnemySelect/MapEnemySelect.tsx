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

type Props = {
  onSelect?: (node: NodePlan) => void
}

const MapEnemySelect: React.FC<Props> = ({ onSelect }) => {
  const [mapData, setMapData] = React.useState<MapData>(maps[0])
  const [node, setNode] = React.useState<MapNode>()
  const [diff, setDiff] = React.useState(4)

  const { openModal, closeModal, Modal } = useModal()
  const nodeModal = useModal()

  const mapKey = idToKey(mapData.id)

  const handleMapSelect = (nextMap: MapData) => {
    if (nextMap !== mapData) {
      setMapData(nextMap)
      setNode(undefined)
    }
    closeModal()
  }

  const handleEnemySelect = (enemy: EnemyFleetState) => {
    if (!node || !onSelect) return
    const { type, point, d } = node
    const name = `${mapKey} ${point}`
    onSelect({ type, point, d, name, enemy })
  }

  const handleNodeClick = (node: MapNode) => {
    if (!node.enemies) return
    setNode(node)
    nodeModal.openModal()
  }

  return (
    <div>
      <Modal>
        <StyledMapSelect onSelect={handleMapSelect} />
      </Modal>

      <Button onClick={openModal} variant="outlined">
        海域 {mapKey}
      </Button>
      <Select
        options={[4, 3, 2, 1]}
        value={diff}
        onChange={setDiff}
        getOptionLabel={(diff) => ["丁", "丙", "乙", "甲"][diff - 1]}
      />
      <NauticalChart data={mapData} onClick={handleNodeClick} />
      {node && <MapNodeContent node={node} difficulty={diff} onEnemySelect={handleEnemySelect} />}
    </div>
  )
}

export default MapEnemySelect
