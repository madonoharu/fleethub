import React from "react"
import { Plan } from "@fleethub/core"

import { Container, Paper, TextField, Button } from "@material-ui/core"

import { Select, SelectButtons, ReactGkcoi } from "../../../components"
import { planToDeck, gkcoiThemes, GkcoiTheme } from "../../../utils"

type Props = {
  plan: Plan
}

const GkcoiTabPanel: React.FC<Props> = ({ plan }) => {
  const [gkcoiTheme, setGkcoiTheme] = React.useState<GkcoiTheme>("dark")

  return (
    <div>
      <Select options={gkcoiThemes} value={gkcoiTheme} onChange={setGkcoiTheme} />
      <ReactGkcoi deck={planToDeck(plan, gkcoiTheme)} />
    </div>
  )
}

export default GkcoiTabPanel
