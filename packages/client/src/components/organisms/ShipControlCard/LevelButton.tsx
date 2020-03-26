import React from "react"
import styled from "styled-components"

import Box from "@material-ui/core/Box"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogContent from "@material-ui/core/DialogContent"
import Button from "@material-ui/core/Button"
import Tooltip from "@material-ui/core/Tooltip"
import BuildIcon from "@material-ui/icons/Build"

import { NumberInput, Slider } from "../../../components"
import { useOpen } from "../../../hooks"

type Props = {
  value: number
  onChange: (value: number) => void
}

const Form: React.FC<Props> = ({ value, onChange }) => {
  console.log(value)
  const set1 = React.useCallback(() => onChange(1), [onChange])
  const set99 = React.useCallback(() => onChange(99), [onChange])
  const set175 = React.useCallback(() => onChange(175), [onChange])

  const inputProps = { min: 1, max: 175, value, onChange }

  return (
    <DialogContent>
      <NumberInput fullWidth {...inputProps} />
      <Slider {...inputProps} />
      <Box display="flex" justifyContent="space-between">
        <Button onClick={set1}>Lv 1</Button>
        <Button onClick={set99}>Lv 99</Button>
        <Button onClick={set175}>Lv 175</Button>
      </Box>
    </DialogContent>
  )
}

const Component: React.FC<Props> = ({ value, onChange }) => {
  const { onOpen, ...hendler } = useOpen()

  return (
    <>
      <Tooltip title="levelを変更">
        <Button size="small" variant="text" onClick={onOpen}>
          Lv{value}
        </Button>
      </Tooltip>
      <Dialog {...hendler}>
        <Form value={value} onChange={onChange} />
      </Dialog>
    </>
  )
}

const StyledComponent = styled(Component)``

export default StyledComponent
