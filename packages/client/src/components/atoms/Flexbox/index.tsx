import React from "react"
import Box, { BoxProps } from "@material-ui/core/Box"

const Flexbox = React.forwardRef<{}, BoxProps>((props, ref) => {
  const boxProps = { ref, display: "flex", alignItems: "center", ...props } as any
  return <Box {...boxProps} />
})

export default Flexbox
