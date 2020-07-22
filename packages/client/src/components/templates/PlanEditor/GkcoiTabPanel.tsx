import React from "react"
import { Plan } from "@fleethub/core"

import { Select, ReactGkcoi } from "../../../components"
import { getGkcoiDeck, gkcoiThemes, GkcoiTheme } from "../../../utils"

type Props = {
  plan: Plan
}

const GkcoiTabPanel: React.FC<Props> = ({ plan }) => {
  const [gkcoiTheme, setGkcoiTheme] = React.useState<GkcoiTheme>("dark")

  return (
    <div>
      <Select options={gkcoiThemes} value={gkcoiTheme} onChange={setGkcoiTheme} />
      <ReactGkcoi deck={getGkcoiDeck(plan, gkcoiTheme)} />
    </div>
  )
}

export default GkcoiTabPanel
