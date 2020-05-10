import React from "react"
import { PageProps } from "gatsby"

import { Container } from "@material-ui/core"

import { GearSelect } from "../components"
import { useGearSelectState } from "../hooks"

const GearsPage: React.FC<PageProps> = () => {
  const { state, actions } = useGearSelectState()
  return (
    <Container>
      <GearSelect state={state} onUpdate={actions.update} />
    </Container>
  )
}

export default GearsPage
