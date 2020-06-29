import React from "react"
import { Plan } from "@fleethub/core"
import styled from "styled-components"

import { TextField } from "@material-ui/core"
import OpenInNew from "@material-ui/icons/OpenInNew"

import { uiSlice, plansSelectors, filesSlice, openFirstPlan } from "../../../store"
import { CopyTextButton, Flexbox } from "../../../components"
import { getDeck4, openKctools, openDeckbuilder } from "../../../utils"

type Props = {
  onImport: () => void
}
const PlanImportContent: React.FCX<{ plan: Plan }> = ({ className, plan }) => {
  const [deck, setDeck] = React.useState("")
  return (
    <div className={className}>
      <TextField value={deck} onChange={(event) => setDeck(event.currentTarget.value)} />
    </div>
  )
}

export default styled(PlanImportContent)`
  padding: 8px;
`
