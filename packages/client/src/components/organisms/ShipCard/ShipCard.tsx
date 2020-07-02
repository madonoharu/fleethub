import React from "react"
import styled from "styled-components"
import { Ship, ShipState } from "@fleethub/core"

import { Box, Paper } from "@material-ui/core"

import { EquipmentList, ShipBanner } from "../../../components"
import { Update } from "../../../utils"

import ShipHeader from "./ShipHeader"
import ShipStats from "./ShipStats"

const Content = styled.div`
  display: flex;
  margin-left: 8px;
  > :first-child {
    flex-shrink: 0;
  }
  > :last-child {
    min-width: 0;
  }
`

type Props = {
  ship: Ship
  update: Update<ShipState>

  onRemove?: () => void
}

const ShipCard: React.FCX<Props> = ({ className, ship, update, onRemove }) => {
  const gears = ship.equipment.items.map(({ gear }) => gear)
  gears.length = 6

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const makeGetNextBonuses = React.useCallback(ship.makeGetNextBonuses, [ship.shipId, ...gears])

  return (
    <Paper className={className}>
      <ShipHeader ship={ship} update={update} onRemove={onRemove} />

      <Content>
        <Box width={128}>
          <ShipBanner shipId={ship.shipId} />
          <ShipStats ship={ship} />
        </Box>

        <EquipmentList
          equipment={ship.equipment}
          update={update}
          canEquip={ship.canEquip}
          makeGetNextBonuses={makeGetNextBonuses}
        />
      </Content>
    </Paper>
  )
}

const Styled = styled(ShipCard)`
  min-height: ${24 * 7}px;

  ${ShipHeader} svg {
    opacity: 0;
  }

  :hover ${ShipHeader} svg {
    opacity: 1;
  }
`

export default Styled
