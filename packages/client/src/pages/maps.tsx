import React from "react"

import { Container } from "@material-ui/core"

import { MapEnemySelect } from "../components"

const MapsPage: React.FC = () => {
  return (
    <Container>
      <MapEnemySelect onSelect={console.log} />
    </Container>
  )
}

export default MapsPage
