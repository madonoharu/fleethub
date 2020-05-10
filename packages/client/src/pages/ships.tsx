import React from "react"
import { PageProps } from "gatsby"

import { Container } from "@material-ui/core"

import { ShipSelect } from "../components"
import { ShipSelectProvider } from "../hooks"

const ShipsPage: React.FC<PageProps> = () => (
  <Container disableGutters fixed>
    <ShipSelectProvider>
      <ShipSelect />
    </ShipSelectProvider>
  </Container>
)

export default ShipsPage
