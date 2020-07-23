import React from "react"
import styled from "styled-components"
import { Plan, PlanState, FleetType } from "@fleethub/core"

import { Flexbox, PlanIcon, NumberInput, TextField, FleetTypeSelect } from "../../../components"
import { Update } from "../../../utils"

import PlanAction from "./PlanAction"

const LevelInput = styled(NumberInput)`
  input {
    width: 26px;
  }
`

type Props = {
  id: string
  plan: Plan
  update: Update<PlanState>
}

const PlanEditorHeader: React.FCX<Props> = ({ className, id, plan, update }) => {
  const handleNameChange = (value: string) => {
    update((draft) => {
      draft.name = value
    })
  }

  const handleHqLevelChange = (next: number) => {
    update((draft) => {
      draft.hqLevel = next
    })
  }

  const handleFleetTypeChange = (value: FleetType) => {
    update((draft) => {
      draft.fleetType = value
    })
  }

  return (
    <Flexbox className={className}>
      <TextField startLabel={<PlanIcon />} value={plan.name} onChange={handleNameChange} />
      <LevelInput startLabel="司令部Lv" value={plan.hqLevel} min={1} max={120} onChange={handleHqLevelChange} />
      <FleetTypeSelect fleetType={plan.fleetType} onChange={handleFleetTypeChange} />

      <PlanAction id={id} plan={plan} update={update} />
    </Flexbox>
  )
}

export default PlanEditorHeader
