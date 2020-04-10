import React from "react"
import styled from "styled-components"
import { EntityId } from "@reduxjs/toolkit"

import { Container, Typography, TextField } from "@material-ui/core"

import { RemoveButton, Select } from "../../../components"
import { useFleet } from "../../../hooks"

import ShipList from "./ShipList"

type Props = {
  className?: string
  uid: EntityId
}

const FleetPanel: React.FC<Props> = ({ className, uid }) => {
  const { entity, actions } = useFleet(uid)

  if (!entity) {
    return <Typography color="error">error</Typography>
  }

  return (
    <Container className={className} maxWidth="md">
      <TextField
        placeholder="編成名"
        value={entity.name}
        onChange={(event) => actions.update({ name: event.currentTarget.value })}
      />
      <div>
        fleet {uid} <RemoveButton onClick={actions.remove} />
      </div>
      <div>
        <Typography>連合第一</Typography>
        <ShipList fleet={uid} ships={entity.main} role="main" onAdd={actions.openShipSelect} />
        <Typography>連合第二</Typography>
        <ShipList fleet={uid} ships={entity.escort} role="escort" onAdd={actions.openShipSelect} />
      </div>
    </Container>
  )
}

export default styled(FleetPanel)`
  ${ShipList} {
    margin-top: 8px;
  }
`
