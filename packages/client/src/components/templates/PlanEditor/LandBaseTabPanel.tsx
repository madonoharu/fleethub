import React from "react"
import styled from "@emotion/styled"
import { Plan, PlanState, Airbase, AirbaseState, AirbaseKey } from "@fleethub/core"

import { AirbaseCard, Flexbox, Swappable } from "../../../components"
import { Update } from "../../../utils"
import { LabeledValue } from "../../atoms"

type PlanAirbaseCardProps = {
  airbase: Airbase
  airbaseKey: AirbaseKey
  updatePlan: Update<PlanState>
}

const PlanAirbaseCard: React.FCX<PlanAirbaseCardProps> = ({ className, airbase, updatePlan, airbaseKey }) => {
  const setState = React.useCallback(
    (next: AirbaseState) => {
      updatePlan((draft) => {
        draft[airbaseKey] = next
      })
    },
    [airbaseKey, updatePlan]
  )

  const updateAirbase: Update<AirbaseState> = React.useCallback(
    (recipe) => {
      updatePlan((draft) => {
        const state = draft[airbaseKey] || (draft[airbaseKey] = {})
        recipe(state)
      })
    },
    [airbaseKey, updatePlan]
  )

  return (
    <Swappable className={className} type="airbase" state={airbase.state} setState={setState}>
      <AirbaseCard label={airbaseKey.replace("a", "基地")} airbase={airbase} update={updateAirbase} />
    </Swappable>
  )
}

const StyledPlanAirbaseCard = styled(PlanAirbaseCard)`
  :not(:last-child) {
    margin-right: 8px;
  }
`

type Props = {
  plan: Plan
  update: Update<PlanState>
}

const LandBaseTabPanel: React.FCX<Props> = ({ className, plan, update }) => {
  return (
    <>
      <div css={{ marginRight: 8 }}>
        <LabeledValue label="防空" value={plan.interceptionPower} />
        <LabeledValue label="高高度防空" value={plan.highAltitudeInterceptionPower} />
      </div>

      <Flexbox className={className}>
        {plan.airbaseEntries.map(([key, airbase]) => (
          <StyledPlanAirbaseCard key={key} airbase={airbase} airbaseKey={key} updatePlan={update} />
        ))}
      </Flexbox>
    </>
  )
}

export default styled(LandBaseTabPanel)`
  > * {
    flex-basis: 200px;
    flex-grow: 1;
  }
`
