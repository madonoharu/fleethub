import React from "react"
import styled from "styled-components"
import { range } from "lodash-es"

import Button from "@material-ui/core/Button"
import Tooltip from "@material-ui/core/Tooltip"
import Popover from "@material-ui/core/Popover"
import Typography from "@material-ui/core/Typography"

import { usePopover } from "../../../hooks"

import Buttons from "./Buttons"

const starsToString = (stars: number) => {
  if (stars === 10) {
    return "★M"
  }
  return `★${stars}`
}

type Props = {
  className?: string
  stars: number
  onChange?: (stars: number) => void
}

const anchorOrigin = { vertical: "bottom", horizontal: "center" } as const

const Component: React.FC<Props> = ({ className, stars, onChange }) => {
  const { onOpen, ...hendler } = usePopover()

  const handleChange = React.useCallback(
    (value: number) => {
      onChange && onChange(value)
      hendler.onClose()
    },
    [onChange, hendler.onClose]
  )

  return (
    <>
      <Tooltip title="改修値選択">
        <Button className={className} onClick={onOpen}>
          {starsToString(stars)}
        </Button>
      </Tooltip>

      <Popover anchorOrigin={anchorOrigin} {...hendler}>
        <Buttons onChange={handleChange} />
      </Popover>
    </>
  )
}

const StyledComponent = styled(Component)`
  width: 24px;
  height: 100%;
  padding: 0;
  color: ${({ theme, stars }) => (stars === 0 ? theme.palette.action.disabled : theme.kc.stars)};
`

export default StyledComponent
