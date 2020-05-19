import React from "react"
import { PlanState } from "@fleethub/core"
import produce from "immer"

import { Container, Paper, TextField, Button } from "@material-ui/core"

import { SelectButtons } from "../../../components"
import { useCachedFhFactory } from "../../../hooks"
import { Update } from "../../../utils"

import FleetTabPanel from "./FleetTabPanel"

const initialPlanState: PlanState = {
  name: "PlanEditor",
  f1: {},
  f2: {},
  a1: {},
}

const tabOptions = ["f1", "f2", "lb"] as const

const PlanEditor: React.FC = (props) => {
  const [state, setState] = React.useState<PlanState>(initialPlanState)
  const [tabKey, setTabKey] = React.useState<typeof tabOptions[number]>("f1")

  const update: Update<PlanState> = React.useCallback((updater) => setState(produce(updater)), [])

  const { createPlan } = useCachedFhFactory()
  const plan = createPlan(state)

  const fleetEntry = plan.fleetEntries.find(([key]) => key === tabKey)

  return (
    <Container>
      <TextField
        value={state.name}
        onChange={(event) => {
          update((draft) => {
            draft.name = event.currentTarget.value
          })
        }}
      />
      <SelectButtons options={tabOptions} value={tabKey} onChange={setTabKey} />
      {fleetEntry && <FleetTabPanel fleet={fleetEntry[1]} fleetKey={fleetEntry[0]} updatePlan={update} />}
    </Container>
  )
}

export default PlanEditor
