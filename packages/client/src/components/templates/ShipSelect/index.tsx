import React from "react"
import { ShipBase } from "@fleethub/core"
import { ShipClassName } from "@fleethub/data"

import { Divider } from "../../../components"
import { useShipSelect, useFhSystem } from "../../../hooks"

import FilterBar from "./FilterBar"
import ShipButton from "./ShipButton"

const sortIdFn = (a: ShipBase, b: ShipBase) => a.sortId - b.sortId

const toShipClassEntries = (ships: ShipBase[]): Array<[number, ShipBase[]]> => {
  const shipClasses = [...new Set(ships.map((ship) => ship.shipClass))]
  return shipClasses.map((shipClass) => [shipClass, ships.filter((ship) => ship.shipClass === shipClass)])
}

type Props = Pick<ReturnType<typeof useShipSelect>, "state" | "setState" | "onSelect"> & {
  visibleShips: ShipBase[]
}

const ShipSelect: React.FC<Props> = ({ visibleShips, state, setState, onSelect }) => {
  const shipClassEntries = toShipClassEntries(visibleShips)

  return (
    <>
      <FilterBar state={state} onChange={setState} />
      {shipClassEntries.map(([shipClass, ships]) => (
        <React.Fragment key={`shipClass-${shipClass}`}>
          <Divider label={ShipClassName[shipClass]} />
          {ships.map((ship) => (
            <ShipButton key={`ship-${ship.id}`} ship={ship} onClick={() => onSelect && onSelect(ship.id)} />
          ))}
        </React.Fragment>
      ))}
    </>
  )
}

const Container: React.FC = () => {
  const { masterShips } = useFhSystem().factory
  const { state, setState, onSelect, filterFn } = useShipSelect()

  const visibleShips = masterShips.filter(filterFn).sort(sortIdFn)

  return <ShipSelect visibleShips={visibleShips} state={state} setState={setState} onSelect={onSelect} />
}

export default Container
