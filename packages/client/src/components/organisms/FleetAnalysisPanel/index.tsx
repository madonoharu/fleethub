import React from "react"
import { Fleet } from "@fleethub/core"
import styled from "styled-components"

import { Paper } from "@material-ui/core"

type Props = {
  fleet: Fleet
}

const FleetAnalysisPanel: React.FC<Props> = ({ fleet }) => {
  return <Paper>aaa: {fleet.transportPoint}</Paper>
}

export default FleetAnalysisPanel
