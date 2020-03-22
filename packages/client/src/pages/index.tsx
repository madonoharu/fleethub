import React from "react"

import { FleetPanel } from "../components"
import { usePlan } from "../hooks"

import Button from "@material-ui/core/Button"

const IndexPage: React.FC = () => {
  const { allIds, actions } = usePlan()

  return (
    <>
      <Button onClick={actions.createFleet}>add fleet</Button>

      {allIds.map((id) => (
        <FleetPanel key={id} uid={id} />
      ))}
    </>
  )
}

export default IndexPage
