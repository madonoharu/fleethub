import React from "react"
import styled from "styled-components"

import Image from "../Image"

const KctoolsIconBase = React.forwardRef<HTMLImageElement, React.ComponentProps<"picture">>((props, ref) => (
  <Image {...props} ref={ref} path={"icons/kctools"} />
))

export default styled(KctoolsIconBase)`
  width: 1em;
  height: 1em;
  border-radius: 50%;
`
