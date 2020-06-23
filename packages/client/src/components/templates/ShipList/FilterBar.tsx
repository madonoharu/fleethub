import React from "react"
import { shipCategoies } from "@fleethub/core"

import { Checkbox, FormControlLabel } from "@material-ui/core"

import { SelectButtons, Flexbox } from "../../../components"
import { ShipListState } from "../../../store"

type Props = {
  state: ShipListState
  onChange: (state: Partial<ShipListState>) => void
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
        <SelectButtons options={shipCategoies} value={state.category} onChange={(category) => onChange({ category })} />
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
