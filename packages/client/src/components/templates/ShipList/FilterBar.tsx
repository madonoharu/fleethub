import React from "react"
import { shipCategoies, ShipCategory } from "@fleethub/core"

import { Checkbox, FormControlLabel } from "@material-ui/core"

import { SelectButtons, Flexbox } from "../../../components"
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

const FilterBar: React.FCX<Props> = ({ state, onChange }) => {
  const toggleAll = () => onChange({ all: !state.all })
  const toggleAbyssal = () => onChange({ abyssal: !state.abyssal })

  return (
    <div>
      <Flexbox>
        <SelectButtons
          options={shipCategoies}
          value={state.category}
          onChange={(category) => onChange({ category })}
          getOptionLabel={(category) => dict[category]}
        />
        <FormControlLabel
          style={{ marginLeft: "auto" }}
          label="全表示"
          control={<Checkbox size="small" checked={state.all} onClick={toggleAll} />}
        />
        <FormControlLabel
          label="深海"
          control={<Checkbox size="small" checked={state.abyssal} onClick={toggleAbyssal} />}
        />
      </Flexbox>
    </div>
  )
}

export default FilterBar
