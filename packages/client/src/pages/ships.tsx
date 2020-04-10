import React from "react"
import { PageProps } from "gatsby"

import { Container } from "@material-ui/core"

import { ShipSelect } from "../components"

const ShipsPage: React.FC<PageProps> = () => (
  <Container>
    <ShipSelect />
  </Container>
)

export default ShipsPage
