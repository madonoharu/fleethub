import React from "react"
import { ShipBase } from "@fleethub/core"

import { Button } from "@material-ui/core"

import { ShipBanner, SelectButtons } from "../../../components"
import { useShipSelect, shipTypeFilterKeys } from "../../../hooks"

type Props = {
  ships: ShipBase[]
}

const FilterBar: React.FCX<Props> = ({ ships }) => {
  const { state, setState, filterFn } = useShipSelect()
  const visibleShips = ships.filter(filterFn)

  return (
    <div>
      <SelectButtons
        options={shipTypeFilterKeys}
        value={state.shipTypeFilter}
        onChange={(key) => setState({ shipTypeFilter: key })}
      />
      {visibleShips.map((ship) => (
        <Button key={`ship-${ship.id}`}>
          <ShipBanner shipId={ship.id} />
          {ship.name}
        </Button>
      ))}
    </div>
  )
}

export default FilterBar
