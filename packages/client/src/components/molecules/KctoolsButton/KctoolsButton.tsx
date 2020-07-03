import React from "react"
import styled from "styled-components"

import withIconButton from "../IconButtons/withIconButton"
import { Image } from "../../atoms"

const IconBase = React.forwardRef<HTMLPictureElement, React.ComponentProps<"picture">>((props, ref) => (
  <Image width={24} height={24} {...props} ref={ref} path={"icons/kctools"} />
))

export const KctoolsIcon = styled(IconBase)`
  border-radius: 50%;
`

const KctoolsButton = withIconButton(KctoolsIcon)
KctoolsButton.defaultProps = {
  title: "制空権シミュレータで開く",
}

export default withIconButton(KctoolsIcon)
