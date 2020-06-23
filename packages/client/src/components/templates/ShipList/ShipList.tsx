import React from "react"
import { ShipBase, ShipState } from "@fleethub/core"
import { ShipClassName } from "@fleethub/data"

import { Divider } from "../../../components"

import FilterBar from "./FilterBar"
import ShipButton from "./ShipButton"
import { useShipListState } from "./useShipListState"

const toShipClassEntries = (ships: ShipBase[]): Array<[number, ShipBase[]]> => {
  const shipClasses = [...new Set(ships.map((ship) => ship.shipClass))]
  return shipClasses.map((shipClass) => [shipClass, ships.filter((ship) => ship.shipClass === shipClass)])
}

type Props = {
  abyssal?: boolean
  onSelect?: (ship: ShipState) => void
}

const ShipList: React.FC<Props> = ({ onSelect }) => {
  const { state, update, visibleShips } = useShipListState()

  const shipClassEntries = toShipClassEntries(visibleShips)

  return (
    <>
      <FilterBar state={state} onChange={update} />
      {shipClassEntries.map(([shipClass, ships]) => (
        <React.Fragment key={`shipClass-${shipClass}`}>
          <Divider label={ShipClassName[shipClass]} />
          {ships.map((ship) => (
            <ShipButton key={`ship-${ship.id}`} ship={ship} onClick={() => onSelect && onSelect({ shipId: ship.id })} />
          ))}
        </React.Fragment>
      ))}
    </>
  )
}

export default ShipList
