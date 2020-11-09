import React from "react"
import styled from "@emotion/styled"
import { shipCategoies, ShipCategory } from "@fleethub/core"

import { SelectButtons, Flexbox, Checkbox } from "../../../components"
import { ShipListState } from "../../../store"

const dict: Record<ShipCategory, string> = {
  Battleship: "戦艦級",
  AircraftCarrier: "航空母艦",
  HeavyCruiser: "重巡級",
  LightCruiser: "軽巡級",
  Destroyer: "駆逐艦",
  CoastalDefenseShip: "海防艦",
  Submarine: "潜水艦",
  SupportShip: "補助艦艇",
}

type Props = {
  state: ShipListState
  onChange: (state: Partial<ShipListState>) => void
}

const FilterBar: React.FCX<Props> = ({ className, state, onChange }) => {
  const toggleAll = () => onChange({ all: !state.all })
  const toggleAbyssal = () => onChange({ abyssal: !state.abyssal })

  return (
    <Flexbox className={className}>
      <SelectButtons
        options={shipCategoies}
        value={state.category}
        onChange={(category) => onChange({ category })}
        getOptionLabel={(category) => dict[category]}
      />
      <Checkbox label="全表示" size="small" checked={state.all} onChange={toggleAll} />
      <Checkbox label="深海" size="small" checked={state.abyssal} onChange={toggleAbyssal} />
    </Flexbox>
  )
}

export default styled(FilterBar)`
  > :first-child {
    margin-right: auto;
  }
`
