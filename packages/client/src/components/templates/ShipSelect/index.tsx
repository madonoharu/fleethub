import React from "react"
import { ShipBase } from "@fleethub/core"
import { ShipClassName } from "@fleethub/data"

import { Divider } from "../../../components"
import { useShipSelectContext } from "../../../hooks"

import FilterBar from "./FilterBar"
import ShipButton from "./ShipButton"

const toShipClassEntries = (ships: ShipBase[]): Array<[number, ShipBase[]]> => {
  const shipClasses = [...new Set(ships.map((ship) => ship.shipClass))]
  return shipClasses.map((shipClass) => [shipClass, ships.filter((ship) => ship.shipClass === shipClass)])
}

type Props = {}

const ShipSelect: React.FC<Props> = () => {
  const { state, setState, actions, visibleShips } = useShipSelectContext()
  const { onSelect } = state

  const shipClassEntries = toShipClassEntries(visibleShips)

  return (
    <>
      <FilterBar state={state} onChange={actions.update} />
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

export default ShipSelect
