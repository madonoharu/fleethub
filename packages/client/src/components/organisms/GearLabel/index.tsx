import React from "react"
import styled from "styled-components"
import { EntityId } from "@reduxjs/toolkit"

import { Typography } from "@material-ui/core"

import { useGear } from "../../../hooks"

import GearLabel from "./GearLabel"

type GearLabelContainerProps = {
  gear: EntityId
  onReselect: () => void
}

const GearLabelContainer: React.FC<GearLabelContainerProps> = ({ gear, onReselect }) => {
  const { kcGear, actions } = useGear(gear)

  if (!kcGear) {
    return <Typography color="error">error</Typography>
  }

  return <GearLabel gear={kcGear} onUpdate={actions.update} onRemove={actions.remove} onReselect={onReselect} />
}

export default GearLabelContainer
