import React from "react"
import styled from "styled-components"
import { Plan, PlanState, FleetType } from "@fleethub/core"

import { Flexbox, NumberInput, TextField, FleetTypeSelect } from "../../../components"
import { Update } from "../../../utils"

import PlanAction from "./PlanAction"

const LevelInput = styled(NumberInput)`
  input {
    width: 26px;
  }
`

type Props = {
  plan: Plan
  update: Update<PlanState>
  onPublish: () => Promise<string>
}

const PlanEditorHeader: React.FCX<Props> = ({ className, plan, update, onPublish }) => {
  const handleNameChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    update((draft) => {
      draft.name = event.currentTarget.value
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
      <TextField startLabel="編成名" value={plan.name} onChange={handleNameChange} />
      <LevelInput startLabel="司令部Lv" value={plan.hqLevel} min={1} max={120} onChange={handleHqLevelChange} />
      <FleetTypeSelect fleetType={plan.fleetType} onChange={handleFleetTypeChange} />

      <PlanAction plan={plan} update={update} onPublish={onPublish} />
    </Flexbox>
  )
}

export default PlanEditorHeader
