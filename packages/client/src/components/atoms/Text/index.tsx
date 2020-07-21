import React from "react"
import styled, { DefaultTheme } from "styled-components"

import { Typography, TypographyProps } from "@material-ui/core"

type Props = Omit<TypographyProps, "color"> & {
  color?: keyof DefaultTheme["colors"]
}

const Text: React.FC<Props> = ({ color, ...muiProps }) => <Typography {...muiProps} />

export default styled(Text)`
  font-size: 0.75rem;
  line-height: 1.66;

  color: ${({ theme, color }) => color && theme.colors[color]};
`
