import React from "react"
import styled from "styled-components"
import { EntityId } from "@reduxjs/toolkit"

import { Container, Typography, TextField } from "@material-ui/core"

import { RemoveButton, Flexbox, SelectButtons } from "../../../components"
import { useFleet } from "../../../hooks"

import ShipList from "./ShipList"

type Props = {
  className?: string
  uid: EntityId
}

const FleetPanel: React.FC<Props> = ({ className, uid }) => {
  const { entity, actions } = useFleet(uid)

  const [fleetIndex, setFleetIndex] = React.useState(0)

  if (!entity) {
    return <Typography color="error">error</Typography>
  }

  return (
    <Container className={className} maxWidth="md">
      <Flexbox>
        <TextField
          placeholder="編成名"
          value={entity.name}
          onChange={(event) => actions.update({ name: event.currentTarget.value })}
        />
        <RemoveButton onClick={actions.remove} />
      </Flexbox>

      <SelectButtons value={fleetIndex} options={[0, 1]} onChange={setFleetIndex} />
      <div>
        {fleetIndex === 0 && (
          <>
            <Typography>第一</Typography>
            <ShipList fleet={uid} ships={entity.main} role="main" onAdd={actions.openShipSelect} />
          </>
        )}
        {fleetIndex === 1 && (
          <>
            <Typography>第二</Typography>
            <ShipList fleet={uid} ships={entity.escort} role="escort" onAdd={actions.openShipSelect} />
          </>
        )}
      </div>
    </Container>
  )
}

export default styled(FleetPanel)`
  ${ShipList} {
    margin-top: 8px;
  }
`
