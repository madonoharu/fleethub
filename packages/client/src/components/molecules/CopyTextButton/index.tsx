import React from "react"
import copy from "copy-to-clipboard"

import MuiTooltip from "@material-ui/core/Tooltip"
import Assignment from "@material-ui/icons/Assignment"
import Alert from "@material-ui/lab/Alert"
import { withStyles } from "@material-ui/core/styles"

import { useOpen } from "../../../hooks"
import { withIconButton } from "../IconButtons"

const AssignmentButton = withIconButton(Assignment)

const Tooltip = withStyles({
  tooltip: {
    padding: 0,
  },
})(MuiTooltip)

type Props = {
  value: string
  message?: string
}

const Component: React.FC<Props> = ({ value, message = "copied" }) => {
  const { open, onOpen, onClose } = useOpen()

  const handleClick = () => {
    const result = copy(value)
    if (result) onOpen()
  }

  return (
    <Tooltip
      open={open}
      onClose={onClose}
      placement="top"
      title={
        <Alert variant="outlined" severity="success">
          {message}
        </Alert>
      }
    >
      <AssignmentButton title="コピー" onClick={handleClick} />
    </Tooltip>
  )
}

export default Component
