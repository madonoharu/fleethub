import React from "react"
import styled from "styled-components"
import { EntityId } from "@reduxjs/toolkit"

import { Container, Typography, TextField } from "@material-ui/core"

import { RemoveButton, Flexbox, SelectButtons, FleetAnalysisPanel } from "../../../components"
import { useFleet } from "../../../hooks"

import ShipList from "./ShipList"

type Props = {
  className?: string
  uid: EntityId
}

const FleetPanel: React.FC<Props> = ({ className, uid }) => {
  const { entity, actions, fhFleet } = useFleet(uid)
  if (!entity || !fhFleet) {
    return <Typography color="error">error</Typography>
  }

  return (
    <Container className={className} maxWidth="md">
      <Flexbox>
        <RemoveButton onClick={actions.remove} />
      </Flexbox>

      <ShipList ships={entity.ships} onAdd={actions.openShipSelect} />
      <FleetAnalysisPanel fleet={fhFleet} />
    </Container>
  )
}

export default styled(FleetPanel)`
  ${ShipList} {
    margin-top: 8px;
  }
`
