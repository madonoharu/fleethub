import React from "react"
import { EntityId } from "@reduxjs/toolkit"

import { Container, Paper, TextField, Button } from "@material-ui/core"

import { SelectButtons } from "../../../components"
import { usePlan } from "../../../hooks"

import FleetTabPanel from "./FleetTabPanel"

const tabOptions = ["f1", "f2", "lb"] as const

type Props = {
  planId: EntityId
}

const PlanEditor: React.FC<Props> = ({ planId }) => {
  const { state, actions, plan } = usePlan(planId)
  const [tabKey, setTabKey] = React.useState<typeof tabOptions[number]>("f1")

  if (!state || !plan) return null

  const fleetEntry = plan.fleetEntries.find(([key]) => key === tabKey)

  return (
    <Container>
      <TextField
        value={state.name}
        onChange={(event) => {
          actions.update((draft) => {
            draft.name = event.currentTarget.value
          })
        }}
      />
      <SelectButtons options={tabOptions} value={tabKey} onChange={setTabKey} />
      {fleetEntry && <FleetTabPanel fleet={fleetEntry[1]} fleetKey={fleetEntry[0]} updatePlan={actions.update} />}
    </Container>
  )
}

export default PlanEditor
