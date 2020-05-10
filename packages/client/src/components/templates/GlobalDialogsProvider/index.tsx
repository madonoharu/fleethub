import React from "react"
import styled from "styled-components"

import { Dialog as MuiDialog, DialogProps, useTheme } from "@material-ui/core"

import { GearSelectProvider, useGearSelectContext, useShipSelectContext, ShipSelectProvider } from "../../../hooks"
import { ShipSelect, GearSelect } from "../../../components"

const Dialog: React.FC<DialogProps> = ({ children, ...rest }) => {
  const theme = useTheme()
  const width = theme.breakpoints.width("md")
  return (
    <MuiDialog maxWidth="md" PaperProps={{ style: { height: "80vh", width, padding: 8 } }} {...rest}>
      <div>{children}</div>
    </MuiDialog>
  )
}

const ShipSelectDialog: React.FC = () => {
  const { state, actions } = useShipSelectContext()
  const open = Boolean(state.onSelect)
  return (
    <Dialog open={open} onClose={actions.close}>
      {open && <ShipSelect />}
    </Dialog>
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

const GlobalDialogsProvider: React.FC = ({ children }) => (
  <ShipSelectProvider>
    <GearSelectProvider>
      {children}
      <ShipSelectDialog />
      <GearSelectDialog />
    </GearSelectProvider>
  </ShipSelectProvider>
)

export default GlobalDialogsProvider
