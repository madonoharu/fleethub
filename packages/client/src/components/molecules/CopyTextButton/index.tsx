import React from "react"
import copy from "copy-to-clipboard"

import { Tooltip as MuiTooltip, withStyles } from "@material-ui/core"
import Assignment from "@material-ui/icons/Assignment"
import Alert from "@material-ui/lab/Alert"

import { withIconButton } from "../IconButtons"

const AssignmentButton = withIconButton(Assignment)

const StyledTooltip = withStyles({
  tooltip: {
    padding: 0,
  },
})(MuiTooltip)

type Props = {
  value: string
  message?: string
}

const CopyTextButton: React.FC<Props> = ({ value, message = "copied" }) => {
  const [open, setOpen] = React.useState(false)

  const handleClick = () => {
    const result = copy(value)
    if (result) setOpen(true)
  }

  return (
    <StyledTooltip
      open={open}
      onClose={() => setOpen(false)}
      placement="top"
      title={
        <Alert variant="outlined" severity="success">
          {message}
        </Alert>
      }
    >
      <span>
        <AssignmentButton title="コピー" onClick={handleClick} />
      </span>
    </StyledTooltip>
  )
}

export default CopyTextButton
