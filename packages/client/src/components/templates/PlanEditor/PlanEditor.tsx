import React from "react"
import { EntityId } from "@reduxjs/toolkit"

import { Container, Paper, TextField, Button } from "@material-ui/core"

import { NumberInput, Flexbox, Select, SelectButtons, ReactGkcoi } from "../../../components"
import { usePlan } from "../../../hooks"

import FleetTabPanel from "./FleetTabPanel"
import GkcoiTabPanel from "./GkcoiTabPanel"

const tabOptions = ["f1", "f2", "lb", "Gkcoi"] as const

type Props = {
  planId: EntityId
  onClose?: () => void
}

const PlanEditor: React.FC<Props> = ({ planId, onClose }) => {
  const { plan, actions } = usePlan(planId)
  const [tabKey, setTabKey] = React.useState<typeof tabOptions[number]>("f1")

  if (!plan) return null

  const fleetEntry = plan.fleetEntries.find(([key]) => key === tabKey)

  const handleNameChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    actions.update((draft) => {
      draft.name = event.currentTarget.value
    })
  }

  const handleHqLevelChange = (next: number) => {
    actions.update((draft) => {
      draft.hqLevel = next
    })
  }

  return (
    <Container>
      <Button onClick={onClose}>back</Button>
      <Flexbox>
        <TextField value={plan.name} onChange={handleNameChange} />
        <NumberInput value={plan.hqLevel} min={1} max={120} onChange={handleHqLevelChange} />
      </Flexbox>
      <SelectButtons options={tabOptions} value={tabKey} onChange={setTabKey} />
      {fleetEntry && <FleetTabPanel fleet={fleetEntry[1]} fleetKey={fleetEntry[0]} updatePlan={actions.update} />}
      {tabKey === "Gkcoi" && <GkcoiTabPanel plan={plan} />}
    </Container>
  )
}

export default PlanEditor
