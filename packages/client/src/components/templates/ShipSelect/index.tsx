import React from "react"
import { ShipBase } from "@fleethub/core"
import { ShipClassName } from "@fleethub/data"

import { Button } from "@material-ui/core"

import { ShipBanner, Divider } from "../../../components"
import { useShipSelect, useFhSystem } from "../../../hooks"

import FilterBar from "./FilterBar"
import ShipButton from "./ShipButton"

const sortIdFn = (a: ShipBase, b: ShipBase) => a.sortId - b.sortId

const toShipClassEntries = (ships: ShipBase[]): Array<[number, ShipBase[]]> => {
  const shipClasses = [...new Set(ships.map((ship) => ship.shipClass))]
  return shipClasses.map((shipClass) => [shipClass, ships.filter((ship) => ship.shipClass === shipClass)])
}

type Props = {
  onSelect?: (shipId: number) => void
}

const Component: React.FC<Props> = ({ onSelect }) => {
  const { state, setState, filterFn } = useShipSelect()

  const { masterShips } = useFhSystem().factory
  const visibleShips = masterShips.filter(filterFn).sort(sortIdFn)

  const shipClassEntries = toShipClassEntries(visibleShips)

  return (
    <>
      <FilterBar state={state} onChange={setState} />
      {shipClassEntries.map(([shipClass, ships]) => (
        <>
          <Divider key={`shipClass-${shipClass}`} label={ShipClassName[shipClass]} />
          {ships.map((ship) => (
            <ShipButton key={`ship-${ship.id}`} ship={ship} onClick={() => onSelect && onSelect(ship.id)} />
          ))}
        </>
      ))}
    </>
  )
}

const Container: React.FC = (props) => {
  const { onSelect } = useShipSelect()
  return <Component onSelect={onSelect} />
}

export default Container
