import React from "react"

import { Checkbox, FormControlLabel } from "@material-ui/core"

import { SelectButtons, Flexbox } from "../../../components"
import { shipTypeFilterKeys, ShipSelectState } from "../../../hooks"

type Props = {
  state: ShipSelectState
  onChange: (state: Partial<ShipSelectState>) => void
}

const FilterBar: React.FCX<Props> = ({ state, onChange }) => {
  const toggleCommonly = () => onChange({ commonly: !state.commonly })
  const toggleAbyssal = () => onChange({ abyssal: !state.abyssal })

  return (
    <div>
      <FormControlLabel
        label="未改造表示"
        control={<Checkbox size="small" checked={state.commonly} onClick={toggleCommonly} />}
      />

      <Flexbox>
        <SelectButtons
          options={shipTypeFilterKeys}
          value={state.shipTypeFilter}
          onChange={(key) => onChange({ shipTypeFilter: key })}
        />
        <FormControlLabel
          style={{ marginLeft: "auto" }}
          label="深海"
          control={<Checkbox size="small" checked={state.abyssal} onClick={toggleAbyssal} />}
        />
      </Flexbox>
    </div>
  )
}

export default FilterBar
