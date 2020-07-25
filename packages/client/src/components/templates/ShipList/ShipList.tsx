import React, { useState } from "react"
import { ShipBase, ShipState } from "@fleethub/core"
import { ShipClassName } from "@fleethub/data"
import { uniq } from "@fleethub/utils"

import { Divider, SearchInput } from "../../../components"

import FilterBar from "./FilterBar"
import ShipButton from "./ShipButton"
import { useShipListState } from "./useShipListState"
import searchShip from "./searchShip"
import ShipSearchResult from "./ShipSearchResult"

const toShipClassEntries = (ships: ShipBase[]): Array<[number, ShipBase[]]> => {
  const shipClasses = uniq(ships.map((ship) => ship.shipClass))
  return shipClasses.map((shipClass) => [shipClass, ships.filter((ship) => ship.shipClass === shipClass)])
}

type Props = {
  abyssal?: boolean
  onSelect?: (ship: ShipState) => void
}

const ShipList: React.FC<Props> = ({ onSelect }) => {
  const { state, update, masterShips, visibleShips } = useShipListState()
  const [searchValue, setSearchValue] = useState("")

  const shipClassEntries = toShipClassEntries(visibleShips)

  const searchResult = searchValue && searchShip(masterShips, searchValue)

  const renderShip = (ship: ShipBase) => (
    <ShipButton key={`ship-${ship.id}`} ship={ship} onClick={() => onSelect && onSelect({ shipId: ship.id })} />
  )

  return (
    <>
      <SearchInput value={searchValue} onChange={setSearchValue} />
      <FilterBar state={state} onChange={update} />
      {searchResult ? (
        <ShipSearchResult searchValue={searchValue} ships={searchResult} renderShip={renderShip} />
      ) : (
        shipClassEntries.map(([shipClass, ships]) => (
          <React.Fragment key={`shipClass-${shipClass}`}>
            <Divider label={ShipClassName[shipClass]} />
            {ships.map(renderShip)}
          </React.Fragment>
        ))
      )}
    </>
  )
}

export default ShipList
