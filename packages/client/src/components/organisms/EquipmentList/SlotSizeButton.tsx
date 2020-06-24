import React from "react"
import styled from "styled-components"

import { Box, Slider, Button, Tooltip, DialogTitle, DialogContent } from "@material-ui/core"
import BuildIcon from "@material-ui/icons/Build"

import { NumberInput } from "../../../components"
import { useModal } from "../../../hooks"

type SlotSizeFormProps = {
  current: number
  max: number
  onChange?: (value: number) => void
}

const SlotSizeForm: React.FC<SlotSizeFormProps> = ({ current, max, onChange }) => {
  const handleSliderChange = (event: unknown, value: number | number[]) => {
    if (typeof value === "number" && onChange) onChange(value)
  }

  const handleInit = () => {
    onChange && onChange(max)
  }

  return (
    <>
      <DialogTitle>搭載数を変更</DialogTitle>
      <DialogContent>
        <Box display="flex">
          <NumberInput variant="outlined" value={current} min={0} onChange={onChange} />
          <Button onClick={handleInit}>初期値({max})</Button>
        </Box>

        <Slider value={current} max={max} onChange={handleSliderChange} />
      </DialogContent>
    </>
  )
}

type Props = Partial<SlotSizeFormProps> & {
  disabled?: boolean
}

const SlotSizeButton: React.FCX<Props> = ({ className, current, max, onChange }) => {
  const Modal = useModal()

  if (current === undefined || max === undefined) {
    return (
      <Button className={className} disabled>
        <BuildIcon fontSize="inherit" />
      </Button>
    )
  }

  return (
    <>
      <Tooltip title="搭載数を変更">
        <Button className={className} size="small" onClick={Modal.show}>
          {current}
        </Button>
      </Tooltip>
      <Modal>
        <SlotSizeForm current={current} max={max} onChange={onChange} />
      </Modal>
    </>
  )
}

export default styled(SlotSizeButton)`
  justify-content: flex-end;
  padding: 0 4px;
  width: 24px;
  color: ${({ current = 0, max = 0, disabled, theme }) => {
    const { palette } = theme
    if (current === 0 || disabled) return palette.action.disabled
    if (current > max) return palette.secondary.light
    return palette.text.primary
  }};
`
