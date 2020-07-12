import React from "react"
import { Plan, PlanState, Airbase, AirbaseState, AirbaseKey } from "@fleethub/core"

import { AirbaseCard, Flexbox } from "../../../components"
import { Update } from "../../../utils"
import styled from "styled-components"
import { useSwap } from "../../../hooks"
import { LabeledValue } from "../../atoms"

const Container = styled(Flexbox)`
  > :first-child {
    margin-right: 8px;
  }
`

const StyledAirbaseCard = styled(AirbaseCard)`
  :not(:last-child) {
    margin-right: 8px;
  }
`

type ConnectedAirbaseCardProps = {
  airbase: Airbase
  airbaseKey: AirbaseKey
  updatePlan: Update<PlanState>
}

const ConnectedAirbaseCard: React.FC<ConnectedAirbaseCardProps> = ({ airbase, updatePlan, airbaseKey }) => {
  const setState = React.useCallback(
    (next: AirbaseState) => {
      updatePlan((draft) => {
        draft[airbaseKey] = next
      })
    },
    [airbaseKey, updatePlan]
  )

  const [ref] = useSwap({ type: "airbase", state: airbase.state, setState })
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
    <StyledAirbaseCard ref={ref} label={airbaseKey.replace("a", "基地")} airbase={airbase} update={updateAirbase} />
  )
}

type Props = {
  plan: Plan
  update: Update<PlanState>
}

const LandBaseTabPanel: React.FCX<Props> = ({ className, plan, update }) => {
  return (
    <>
      <Container>
        <LabeledValue label="防空" value={plan.interceptionPower} />
        <LabeledValue label="高高度防空" value={plan.highAltitudeInterceptionPower} />
      </Container>

      <Flexbox className={className}>
        {plan.airbaseEntries.map(([key, airbase]) => (
          <ConnectedAirbaseCard key={key} airbase={airbase} airbaseKey={key} updatePlan={update} />
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
