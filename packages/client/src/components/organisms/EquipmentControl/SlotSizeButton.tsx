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
  value: number
  max: number
  onChange?: (value: number) => void
}

const SlotSizeForm: React.FCX<SlotSizeFormProps> = ({ className, value, max, onChange }) => {
  const handleSliderChange = React.useCallback(
    (event: unknown, value: number | number[]) => {
      if (typeof value === "number" && onChange) onChange(value)
    },
    [onChange]
  )
  return (
    <>
      <DialogTitle>搭載数を変更</DialogTitle>
      <DialogContent>
        <Box display="flex">
          <NumberInput variant="outlined" value={value} max={max} onChange={onChange} />
          <Button>初期値({max})</Button>
        </Box>

        <Slider value={value} max={max} onChange={handleSliderChange} />
      </DialogContent>
    </>
  )
}

type Props = {
  className?: string

  value?: number
  max?: number
  onChange?: (value: number) => void
}

const Component: React.FC<Props> = ({ className, value, max, onChange }) => {
  const { onOpen, ...hendler } = useOpen()

  if (value === undefined || max === undefined) {
    return (
      <Button className={className} variant="text" disabled>
        <BuildIcon fontSize="inherit" />
      </Button>
    )
  }

  return (
    <>
      <Tooltip title="搭載数を変更">
        <Button className={className} size="small" variant="text" onClick={onOpen}>
          {value}
        </Button>
      </Tooltip>
      <Dialog {...hendler}>
        <SlotSizeForm value={value} max={max} onChange={onChange} />
      </Dialog>
    </>
  )
}

const StyledComponent = styled(Component)`
  display: flex;
  align-items: center;
  justify-content: end;
  width: 24px;
  color: ${(props) => props.theme.palette.grey[500]};
`

export default StyledComponent
