import React from "react"
import styled from "styled-components"
import { Plan, PlanState, FleetType } from "@fleethub/core"

import { Flexbox, PlanIcon, NumberInput, TextField, FleetTypeSelect } from "../../../components"
import { Update } from "../../../utils"
import { useFile } from "../../../hooks"

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
  const { file, actions: fileActions } = useFile(id)

  const handleNameChange = (name: string) => fileActions.update({ name })

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

  if (!file) return null

  return (
    <Flexbox className={className}>
      <TextField placeholder="name" startLabel={<PlanIcon />} value={file.name} onChange={handleNameChange} />
      <LevelInput startLabel="司令部Lv" value={plan.hqLevel} min={1} max={120} onChange={handleHqLevelChange} />
      <FleetTypeSelect fleetType={plan.fleetType} onChange={handleFleetTypeChange} />

      <PlanAction id={id} name={file.name || ""} plan={plan} />
    </Flexbox>
  )
}

export default PlanEditorHeader
