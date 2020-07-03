import React from "react"
import styled from "styled-components"
import { FleetTypes } from "@fleethub/core"

import { Container } from "@material-ui/core"

import { SelectButtons, PlanShareContent, Select, PlanAnalysisPanel } from "../../../components"
import { usePlan, useModal } from "../../../hooks"

import FleetTabPanel from "./FleetTabPanel"
import LandBaseTabPanel from "./LandBaseTabPanel"
import GkcoiTabPanel from "./GkcoiTabPanel"
import BattlePlanPanel from "./BattlePlanPanel"
import PlanEditorHeader from "./PlanEditorHeader"

const tabOptions = ["f1", "f2", "f3", "f4", "lb", "Gkcoi"] as const

type Props = {
  planId: string
}

const PlanEditor: React.FC<Props> = ({ planId }) => {
  const { plan, actions, state } = usePlan(planId)
  const [tabKey, setTabKey] = React.useState<typeof tabOptions[number]>("f1")

  const Modal = useModal()

  if (!plan || !state) return null

  const fleetEntry = plan.fleetEntries.find(([key]) => key === tabKey)

  return (
    <Container>
      <PlanEditorHeader plan={plan} update={actions.update} />
      <Select
        options={FleetTypes}
        value={plan.fleetType}
        onChange={(value) =>
          actions.update((draft) => {
            draft.fleetType = value
          })
        }
      />

      <SelectButtons options={tabOptions} value={tabKey} onChange={setTabKey} />
      {fleetEntry && <FleetTabPanel fleet={fleetEntry[1]} fleetKey={fleetEntry[0]} updatePlan={actions.update} />}
      {tabKey === "lb" && <LandBaseTabPanel plan={plan} update={actions.update} />}
      {tabKey === "Gkcoi" && <GkcoiTabPanel plan={plan} />}

      <PlanAnalysisPanel plan={plan} />

      <Modal>
        <PlanShareContent plan={plan} />
      </Modal>
    </Container>
  )
}

export default PlanEditor
