import React from "react"

import { Container, TextField, Button } from "@material-ui/core"

import { NumberInput, Flexbox, SelectButtons, ShareButton, TweetButton } from "../../../components"
import { usePlan, useModal } from "../../../hooks"

import FleetTabPanel from "./FleetTabPanel"
import LandBaseTabPanel from "./LandBaseTabPanel"
import GkcoiTabPanel from "./GkcoiTabPanel"
import BattlePlanPanel from "./BattlePlanPanel"
import PlanTweetButton from "./PlanTweetButton"

const tabOptions = ["f1", "f2", "f3", "f4", "lb", "Gkcoi"] as const

type Props = {
  planId: string
}

const PlanEditor: React.FC<Props> = ({ planId }) => {
  const { plan, actions, state } = usePlan(planId)
  const [tabKey, setTabKey] = React.useState<typeof tabOptions[number]>("f1")

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
      <Flexbox>
        <TextField value={plan.name} onChange={handleNameChange} />
        <NumberInput style={{ width: 60 }} value={plan.hqLevel} min={1} max={120} onChange={handleHqLevelChange} />
        <ShareButton />
        <PlanTweetButton plan={state} />
      </Flexbox>
      <SelectButtons options={tabOptions} value={tabKey} onChange={setTabKey} />
      {fleetEntry && <FleetTabPanel fleet={fleetEntry[1]} fleetKey={fleetEntry[0]} updatePlan={actions.update} />}
      {tabKey === "lb" && <LandBaseTabPanel plan={plan} update={actions.update} />}
      {tabKey === "Gkcoi" && <GkcoiTabPanel plan={plan} />}

      <BattlePlanPanel plan={plan} updatePlan={actions.update} />
    </Container>
  )
}

export default PlanEditor
