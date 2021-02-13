import React from "react"
import styled from "@emotion/styled"
import { Ship } from "@fleethub/sim"

import { Button } from "@material-ui/core"

import ShipNameplate from "./ShipNameplate"

type Props = {
  ship: Ship
  onClick?: () => void
}

const ShipButton: React.FCX<Props> = ({ className, ship, onClick }) => {
  return (
    <Button className={className} onClick={onClick}>
      <ShipNameplate shipId={ship.ship_id} banner={ship.banner} name={ship.name} />
    </Button>
  )
}

export default styled(ShipButton)`
  justify-content: flex-start;
  width: 232px;
`
