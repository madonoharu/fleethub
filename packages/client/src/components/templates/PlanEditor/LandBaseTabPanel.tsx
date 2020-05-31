import React from "react"
import { Plan, PlanState, Airbase, AirbaseState, AirbaseKey } from "@fleethub/core"

import { Container, Paper, TextField, Button } from "@material-ui/core"

import { AirbaseCard, Flexbox } from "../../../components"
import { Update } from "../../../utils"
import styled from "styled-components"

type ConnectedAirbaseCardProps = {
  airbase: Airbase
  airbaseKey: AirbaseKey
  updatePlan: Update<PlanState>
}

const ConnectedAirbaseCard: React.FC<ConnectedAirbaseCardProps> = ({ airbase, updatePlan, airbaseKey }) => {
  const updateAirbase: Update<AirbaseState> = React.useCallback(
    (recipe) => {
      updatePlan((draft) => {
        const state = draft[airbaseKey] || (draft[airbaseKey] = {})
        recipe(state)
      })
    },
    [airbaseKey, updatePlan]
  )

  return <AirbaseCard airbase={airbase} update={updateAirbase} />
}

type Props = {
  plan: Plan
  update: Update<PlanState>
}

const LandBaseTabPanel: React.FCX<Props> = ({ className, plan, update }) => {
  return (
    <Flexbox className={className}>
      {plan.airbaseEntries.map(([key, airbase]) => (
        <ConnectedAirbaseCard key={key} airbase={airbase} airbaseKey={key} updatePlan={update} />
      ))}
    </Flexbox>
  )
}

export default styled(LandBaseTabPanel)`
  > * {
    flex-basis: 200px;
    flex-grow: 1;
  }
`
