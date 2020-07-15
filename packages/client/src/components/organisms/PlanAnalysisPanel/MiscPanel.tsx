import React from "react"
import styled from "styled-components"
import { Plan } from "@fleethub/core"

import { LabeledValue } from "../../atoms"

type Prosp = {
  plan: Plan
}

const MiscPanel: React.FC<Prosp> = ({ plan }) => {
  return (
    <div>
      <LabeledValue label="TP" value={plan.main.transportPoint} />
    </div>
  )
}

export default MiscPanel
