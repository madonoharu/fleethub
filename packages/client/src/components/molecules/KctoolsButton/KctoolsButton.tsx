import React from "react"
import styled from "styled-components"

import withIconButton from "../IconButtons/withIconButton"

const IconBase = React.forwardRef<HTMLImageElement, React.ComponentProps<"img">>((props, ref) => (
  <img ref={ref} width={24} height={24} {...props} src={require("../../../images/kctools.webp")} />
))

export const KctoolsIcon = styled(IconBase)`
  border-radius: 50%;
`

const KctoolsButton = withIconButton(KctoolsIcon)
KctoolsButton.defaultProps = {
  title: "制空権シミュレータで開く",
}

export default withIconButton(KctoolsIcon)
