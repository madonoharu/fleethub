import React from "react"
import styled from "styled-components"
import { EntityId } from "@reduxjs/toolkit"

import { Typography } from "@material-ui/core"

import { useGear } from "../../../hooks"

import GearLabel from "./GearLabel"

type GearLabelContainerProps = {
  gear: EntityId
  equippable?: boolean
  onReselect: () => void
}

const GearLabelContainer: React.FC<GearLabelContainerProps> = ({ gear, equippable, onReselect }) => {
  const { fhGear, actions } = useGear(gear)

  if (!fhGear) {
    return <Typography color="error">error</Typography>
  }

  return (
    <GearLabel
      gear={fhGear}
      equippable={equippable}
      onUpdate={actions.update}
      onRemove={actions.remove}
      onReselect={onReselect}
    />
  )
}

export default GearLabelContainer
