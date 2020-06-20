import React from "react"
import styled from "styled-components"

import { Box, DialogContent, Button, Tooltip } from "@material-ui/core"

import { NumberInput, Slider } from "../../../components"
import { useModal } from "../../../hooks"

type Props = {
  value: number
  onChange: (value: number) => void
}

const Form: React.FC<Props> = ({ value, onChange }) => {
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

const Component: React.FCX<Props> = ({ className, value, onChange }) => {
  const Modal = useModal()

  return (
    <>
      <Tooltip title="levelを変更">
        <Button className={className} onClick={Modal.show}>
          Lv{value}
        </Button>
      </Tooltip>
      <Modal>
        <Form value={value} onChange={onChange} />
      </Modal>
    </>
  )
}

const StyledComponent = styled(Component)`
  padding: 0 4px;
`

export default StyledComponent
