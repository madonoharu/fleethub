import React from "react"
import { PlanState, FleetState } from "@fleethub/core"

const FleetEditor: React.FC<{ state: FleetState }> = ({ state }) => {
  return <>{state.ships.length}</>
}

const PlanEditor: React.FC = (props) => {
  const [state, setState] = React.useState<PlanState>({ name: "", fleets: [], airbases: [] })
  const [fleetIndex, setFleetIndex] = React.useState(0)
  return <></>
}

export default PlanEditor
