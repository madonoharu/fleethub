import React from "react"
import styled from "styled-components"
import { FleetKey } from "@fleethub/core"
import { useDrag, useDrop } from "react-dnd"

import { Typography } from "@material-ui/core"

import { PlanShareContent, PlanAnalysisPanel, Tabs } from "../../../components"

type Props = {
  fleetKey: FleetKey
  onSwap?: (drag: FleetKey, drop: FleetKey) => void
}

const FleetTabLabel: React.FC<Props> = ({ fleetKey, onSwap }) => {
  const item = { type: "fleet", fleetKey }

  const [isDragging, dragRef] = useDrag({
    item,
    collect: (monitor) => monitor.isDragging(),
  })

  const [, dropRef] = useDrop({
    accept: item.type,
    canDrop: (dragItem: typeof item) => dragItem.fleetKey !== item.fleetKey,
    drop: (dragItem) => onSwap?.(dragItem.fleetKey, fleetKey),
  })

  const label = fleetKey.replace("f", "第")

  return (
    <Typography innerRef={(node) => dragRef(dropRef(node))} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {label}
    </Typography>
  )
}

export default FleetTabLabel
