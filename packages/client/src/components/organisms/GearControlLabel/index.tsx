import React from "react"
import styled from "styled-components"
import { EntityId } from "@reduxjs/toolkit"

import Typography from "@material-ui/core/Typography"
import Button from "@material-ui/core/Button"

import { useGear } from "../../../hooks"

import AddGearButton from "./AddGearButton"
import Label from "./Label"

type GearLabelProps = {
  gear: EntityId
  onReselect: () => void
}

const GearLabel: React.FC<GearLabelProps> = ({ gear, onReselect }) => {
  const { entity, actions } = useGear(gear)

  if (!entity) {
    return <Typography color="error">error</Typography>
  }

  return (
    <Label
      gear={{
        ...entity,
        iconId: 1,
        name: "長いいいいいいいいいいいいいいいいいいいいいいいいいいい装備名",
        hasProficiency: true,
      }}
      onUpdate={actions.update}
      onRemove={actions.remove}
      onReselect={onReselect}
    />
  )
}

type ContainerProps = {
  gear?: EntityId
  onAdd: () => void
}

const Container: React.FC<ContainerProps> = ({ gear, onAdd }) => {
  if (!gear) {
    return <AddGearButton onClick={onAdd} />
  }

  return <GearLabel gear={gear} onReselect={onAdd} />
}

export default Container
