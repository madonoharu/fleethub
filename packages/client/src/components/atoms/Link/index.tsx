import React from "react"
import MuiLink, { LinkProps } from "@material-ui/core/Link"
import { Link as GatsbyLink, GatsbyLinkProps } from "gatsby"

type Props = Omit<LinkProps<typeof GatsbyLink>, "component" | "as"> & GatsbyLinkProps<unknown>

const Component = React.forwardRef<GatsbyLink<unknown> & HTMLSpanElement, Props>((props, ref) => {
  return <MuiLink component={GatsbyLink} ref={ref} {...props} />
})

export default Component
