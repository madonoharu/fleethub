import React from "react"
import { PageProps } from "gatsby"

import { Container } from "@material-ui/core"

import { GearList } from "../components"

const GearsPage: React.FC<PageProps> = () => {
  return (
    <Container>
      <GearList />
    </Container>
  )
}

export default GearsPage
