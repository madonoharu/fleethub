import React from "react"
import styled from "styled-components"

import Box from "@material-ui/core/Box"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogContent from "@material-ui/core/DialogContent"
import Slider from "@material-ui/core/Slider"
import Button from "@material-ui/core/Button"
import Tooltip from "@material-ui/core/Tooltip"
import BuildIcon from "@material-ui/icons/Build"

import { NumberInput } from "../../../components"
import { useOpen } from "../../../hooks"

type SlotSizeFormProps = {
  current: number
  inital: number
  onChange?: (value: number) => void
}

const SlotSizeForm: React.FCX<SlotSizeFormProps> = ({ className, current, inital, onChange }) => {
  const handleSliderChange = React.useCallback(
    (event: unknown, value: number | number[]) => {
      if (typeof value === "number" && onChange) onChange(value)
    },
    [onChange]
  )

  const handleInit = React.useCallback(() => {
    onChange && onChange(inital)
  }, [onChange, inital])
  return (
    <>
      <DialogTitle>搭載数を変更</DialogTitle>
      <DialogContent>
        <Box display="flex">
          <NumberInput variant="outlined" value={current} min={0} onChange={onChange} />
          <Button onClick={handleInit}>初期値({inital})</Button>
        </Box>

        <Slider value={current} max={inital} onChange={handleSliderChange} />
      </DialogContent>
    </>
  )
}

type Props = {
  className?: string

  current?: number
  inital?: number
  onChange?: (value: number) => void

  disabled?: boolean
}

const Component: React.FC<Props> = ({ className, current, inital, onChange }) => {
  const { onOpen, ...hendler } = useOpen()

  if (current === undefined || inital === undefined) {
    return (
      <Button className={className} variant="text" disabled>
        <BuildIcon fontSize="inherit" />
      </Button>
    )
  }

  return (
    <>
      <Tooltip title="搭載数を変更">
        <Button className={className} size="small" onClick={onOpen}>
          {current}
        </Button>
      </Tooltip>
      <Dialog {...hendler}>
        <SlotSizeForm current={current} inital={inital} onChange={onChange} />
      </Dialog>
    </>
  )
}

const StyledComponent = styled(Component)`
  display: flex;
  align-items: center;
  justify-content: end;
  width: 24px;
  color: ${({ current = 0, inital = 0, disabled, theme }) => {
    const { palette } = theme
    if (current === 0 || disabled) return palette.action.disabled
    if (current > inital) return palette.secondary.light
    return palette.text.primary
  }};
`

export default StyledComponent
