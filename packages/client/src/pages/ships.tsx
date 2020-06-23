import React from "react"
import { PageProps } from "gatsby"

import { Container } from "@material-ui/core"

import { ShipList } from "../components"

const ShipsPage: React.FC<PageProps> = () => (
  <Container disableGutters fixed>
    <ShipList />
  </Container>
)

export default ShipsPage
