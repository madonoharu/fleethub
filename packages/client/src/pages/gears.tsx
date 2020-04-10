import React from "react"
import { PageProps } from "gatsby"

import { Container } from "@material-ui/core"

import { GearSelect } from "../components"

const GearsPage: React.FC<PageProps> = () => (
  <Container>
    <GearSelect />
  </Container>
)

export default GearsPage
