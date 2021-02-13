import { EntityId } from "@reduxjs/toolkit"
import React from "react"

import { Container } from "@material-ui/core"

import PlanTabs from "./PlanTabs"

type PlanScreenProps = {
  id: EntityId
}

const PlanScreen: React.FCX<PlanScreenProps> = ({ id }) => {
  return (
    <Container>
      <PlanTabs id={id} />
    </Container>
  )
}

export default PlanScreen
