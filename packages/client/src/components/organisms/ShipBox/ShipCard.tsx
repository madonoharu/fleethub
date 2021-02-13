import React from "react"
import styled from "@emotion/styled"
import { Ship } from "@fleethub/sim"
import { GEAR_KEYS, GearState } from "@fleethub/utils"

import { Paper } from "@material-ui/core"

import { ShipBanner } from "../../molecules"

import { ShipEntity, GearPosition } from "../../../store"
import { makeGetNextEbonuses } from "../../../utils"

import ShipHeader from "./ShipHeader"
import ShipStats from "./ShipStats"
import GearSlot from "./GearSlot"

const ShipCardInfo = styled.div`
  flex-shrink: 0;
`

const ShipCardContent = styled.div`
  display: flex;
  margin-left: 8px;
`

const GearList = styled.div`
  flex-grow: 1;
  > * {
    height: 24px;
  }
`

type Props = {
  ship: Ship
  entity: ShipEntity
  onDetailClick?: () => void
  onRemove?: () => void
  onGearChange?: (state: GearState, to: GearPosition) => void
}

const ShipCard: React.FCX<Props> = ({ className, ship, entity, onDetailClick, onRemove, onGearChange }) => {
  return (
    <Paper className={className}>
      <ShipHeader ship={ship} onDetailClick={onDetailClick} onRemove={onRemove} />

      <ShipCardContent>
        <ShipCardInfo>
          <ShipBanner publicId={ship.banner} size="medium" />
          <ShipStats ship={ship} />
        </ShipCardInfo>
        <GearList>
          {GEAR_KEYS.map((key) => (
            <GearSlot
              key={key}
              id={entity[key]}
              onGearChange={(state) => {
                onGearChange?.(state, { id: entity.id, key })
              }}
              canEquip={(g) => ship.can_equip(g, key)}
              getNextEbonuses={makeGetNextEbonuses(ship, key)}
            />
          ))}
        </GearList>
      </ShipCardContent>
    </Paper>
  )
}

const Styled = styled(ShipCard)`
  ${ShipHeader} svg {
    visibility: hidden;
  }
  :hover ${ShipHeader} svg {
    visibility: visible;
  }
`

export default Styled
