import React from "react"
import styled from "styled-components"

import { Dialog as MuiDialog, DialogProps, useTheme } from "@material-ui/core"

import { useShipSelect, GearSelectProvider, useGearSelectContext } from "../../../hooks"
import { ShipSelect, GearSelect } from "../.."

const Dialog: React.FC<DialogProps> = ({ children, ...rest }) => {
  const theme = useTheme()
  const width = theme.breakpoints.width("md")
  return (
    <MuiDialog maxWidth="md" PaperProps={{ style: { height: "80vh", width, padding: 8 } }} {...rest}>
      <div>{children}</div>
    </MuiDialog>
  )
}

const GearSelectDialog: React.FC = () => {
  const { state, actions } = useGearSelectContext()
  const open = Boolean(state.onSelect)

  return (
    <Dialog open={open} onClose={actions.close}>
      {open && <GearSelect state={state} onUpdate={actions.update} />}
    </Dialog>
  )
}

const GlobalDialogsProvider: React.FC = ({ children }) => {
  const shipSelect = useShipSelect()
  return (
    <GearSelectProvider>
      {children}
      <GearSelectDialog />
      <Dialog open={shipSelect.open} onClose={shipSelect.onClose}>
        {shipSelect.open && <ShipSelect />}
      </Dialog>
    </GearSelectProvider>
  )
}

export default GlobalDialogsProvider
