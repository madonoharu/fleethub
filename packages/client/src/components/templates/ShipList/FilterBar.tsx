import React from "react"
import styled from "@emotion/styled"

import { ShipListState } from "../../../store"

import { Flexbox, Checkbox } from "../../atoms"
import { SelectButtons } from "../../molecules"

const basicFilterMap = {
  Battleship: "戦艦級",
  AircraftCarrier: "航空母艦",
  HeavyCruiser: "重巡級",
  LightCruiser: "軽巡級",
  Destroyer: "駆逐艦",
  CoastalDefenseShip: "海防艦",
  Submarine: "潜水艦",
  SupportShip: "補助艦艇",
} as const

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
        css={{ marginRight: "auto" }}
        options={Object.keys(basicFilterMap)}
        value={state.basicFilter}
        onChange={(basicFilter) => onChange({ basicFilter })}
        getOptionLabel={(key) => basicFilterMap[key as keyof typeof basicFilterMap]}
      />
      <Checkbox label="全表示" size="small" checked={state.all} onChange={toggleAll} />
      <Checkbox label="深海" size="small" checked={state.abyssal} onChange={toggleAbyssal} />
    </Flexbox>
  )
}

export default FilterBar
