import React from "react"
import { Plan, PlanState, Airbase, AirbaseState, AirbaseKey } from "@fleethub/core"

import { Container, Paper, TextField, Button } from "@material-ui/core"

import { EquipmentList } from "../../../components"
import { Update } from "../../../utils"

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

  return <EquipmentList equipment={airbase.equipment} update={updateAirbase} />
}

type Props = {
  plan: Plan
  update: Update<PlanState>
}

const LandBaseTabPanel: React.FC<Props> = ({ plan, update }) => {
  return (
    <div>
      {plan.airbaseEntries.map(([key, airbase]) => (
        <ConnectedAirbaseCard key={key} airbase={airbase} airbaseKey={key} updatePlan={update} />
      ))}
    </div>
  )
}

export default LandBaseTabPanel
