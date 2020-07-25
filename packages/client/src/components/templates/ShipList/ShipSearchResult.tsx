import React from "react"
import styled from "styled-components"
import { ShipBase, ShipState } from "@fleethub/core"

import { Typography } from "@material-ui/core"

import { Divider } from "../../../components"

type Props = {
  searchValue: string
  ships: ShipBase[]
  renderShip: (ship: ShipBase) => React.ReactNode
}

const ShipSearchResult: React.FC<Props> = ({ searchValue, ships, renderShip }) => {
  const text = (
    <Typography>
      &quot;{searchValue}&quot;の検索結果 {ships.length === 0 && "見つかりませんでした"}
    </Typography>
  )
  return (
    <div>
      {text}
      {ships.map(renderShip)}
    </div>
  )
}

export default ShipSearchResult
