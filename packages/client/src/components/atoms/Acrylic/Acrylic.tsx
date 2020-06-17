import React from "react"
import styled, { css } from "styled-components"

import { Paper } from "@material-ui/core"

const acrylicStyle = css`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
`

const firefoxStyle = css`
  background: rgba(60, 60, 70, 0.95);
`

const isFirefox = window.navigator.userAgent.includes("Firefox")

const Acrylic = styled(Paper)`
  ${isFirefox ? firefoxStyle : acrylicStyle}
`

export default Acrylic
