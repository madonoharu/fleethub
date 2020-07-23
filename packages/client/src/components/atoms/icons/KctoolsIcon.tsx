import React from "react"
import styled from "styled-components"

import Image from "../Image"

const KctoolsIconBase = React.forwardRef<HTMLPictureElement, React.ComponentProps<"picture">>((props, ref) => (
  <Image width={24} height={24} {...props} ref={ref} path={"icons/kctools"} />
))

export default styled(KctoolsIconBase)`
  border-radius: 50%;
`
