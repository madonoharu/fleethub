import React from "react"
import styled from "styled-components"

import { SelectButtons } from "../../../components"

import FilterIcon from "./FilterIcon"

const getFilterIcon = (key: string) => key

type Props = {
  value: string
  options: string[]
  onChange: (value: string) => void
}

const GearFilterButtons: React.FCX<Props> = (props) => <SelectButtons {...props} getOptionLabel={getFilterIcon} />

export default styled(GearFilterButtons)`
  button {
    padding: 4px 0;
  }
`
