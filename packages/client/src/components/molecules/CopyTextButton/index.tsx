import React from "react"
import copy from "copy-to-clipboard"

import Assignment from "@material-ui/icons/Assignment"

import { withIconButton } from "../IconButtons"
import { useSnackbar } from "../../../hooks"

const AssignmentButton = withIconButton(Assignment)

type Props = {
  value: string
  message?: string
}

const CopyTextButton: React.FC<Props> = ({ value, message = "copied" }) => {
  const Snackbar = useSnackbar()

  const handleClick = () => {
    const result = copy(value)
    if (result) Snackbar.show({ message: "コピーしました" })
    else Snackbar.show({ message: "失敗しました", severity: "error" })
  }

  return (
    <>
      <AssignmentButton title="コピー" onClick={handleClick} />
      <Snackbar />
    </>
  )
}

export default CopyTextButton
