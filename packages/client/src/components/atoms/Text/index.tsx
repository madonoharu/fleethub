import React from "react"
import { css, Theme } from "@emotion/react"
import styled from "@emotion/styled"

import { Typography, TypographyProps } from "@material-ui/core"

type Props = Omit<TypographyProps, "color"> & {
  color?: keyof Theme["colors"]
}

const Text: React.FC<Props> = ({ color, ...muiProps }) => <Typography {...muiProps} />

export default styled(Text)(
  ({ theme, color }) => css`
    font-size: 0.75rem;
    line-height: 1.66;

    color: ${color && theme.colors[color]};
  `
)
