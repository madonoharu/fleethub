import React from "react"
import styled from "styled-components"
import { EntityId } from "@reduxjs/toolkit"

import Container from "@material-ui/core/Container"
import Button from "@material-ui/core/Button"
import Typography from "@material-ui/core/Typography"
import DeleteIcon from "@material-ui/icons/Delete"

import { ShipControlCard, RemoveButton } from "../../../components"
import { useFleet } from "../../../hooks"
import { NullableArray } from "../../../utils"
import { ShipPosition } from "../../../store"
import { withIconButton } from "../../../hocs"

import ShipList from "./ShipList"

type Props = {
  className?: string
  uid: EntityId
}

const FleetPanel: React.FC<Props> = ({ className, uid }) => {
  const { entity, actions, openShipSelect } = useFleet(uid)

  if (!entity) {
    return <>fleet not found</>
  }

  return (
    <Container className={className}>
      <div>
        fleet {uid} <RemoveButton onClick={actions.remove} />
      </div>
      <div>
        <Typography>連合第一</Typography>
        <ShipList fleet={uid} ships={entity.main} role="main" onAdd={openShipSelect} />
        <Typography>連合第二</Typography>
        <ShipList fleet={uid} ships={entity.escort} role="escort" onAdd={openShipSelect} />
      </div>
    </Container>
  )
}

export default styled(FleetPanel)`
  ${ShipList} {
    margin-top: 8px;
  }
`
