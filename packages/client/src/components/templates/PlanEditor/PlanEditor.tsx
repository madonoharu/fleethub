import React from "react"

import { Container, TextField, Button } from "@material-ui/core"

import {
  NumberInput,
  Flexbox,
  SelectButtons,
  ShareButton,
  PlanShareContent,
  LinkButton,
  KctoolsButton,
} from "../../../components"
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
      <PlanEditorHeader plan={plan} update={actions.update} />

      <SelectButtons options={tabOptions} value={tabKey} onChange={setTabKey} />
      {fleetEntry && <FleetTabPanel fleet={fleetEntry[1]} fleetKey={fleetEntry[0]} updatePlan={actions.update} />}
      {tabKey === "lb" && <LandBaseTabPanel plan={plan} update={actions.update} />}
      {tabKey === "Gkcoi" && <GkcoiTabPanel plan={plan} />}

      <BattlePlanPanel plan={plan} updatePlan={actions.update} />

      <Modal>
        <PlanShareContent plan={plan} />
      </Modal>
    </Container>
  )
}

export default PlanEditor
