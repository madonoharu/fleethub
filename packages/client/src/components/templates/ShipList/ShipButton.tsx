import React from "react"
import styled from "styled-components"
import { ShipBase } from "@fleethub/core"

import { Button } from "@material-ui/core"

import ShipNameplate from "./ShipNameplate"

type Props = {
  ship: ShipBase
  onClick?: () => void
}

const ShipButton: React.FCX<Props> = ({ className, ship, onClick }) => {
  return (
    <Button className={className} onClick={onClick}>
      <ShipNameplate shipId={ship.shipId} banner={ship.banner} name={ship.name} />
    </Button>
  )
}

export default styled(ShipButton)`
  justify-content: flex-start;
  width: 232px;
`
