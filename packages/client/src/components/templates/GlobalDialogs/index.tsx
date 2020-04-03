import React from "react"

import { Dialog as MuiDialog, DialogProps } from "@material-ui/core"

import { useShipSelect, useGearSelect } from "../../../hooks"
import { ShipSelect, GearSelect } from "../../../components"

const Dialog: React.FC<DialogProps> = (props) => <MuiDialog fullWidth maxWidth="md" {...props} />

const GlobalDialogs: React.FC = () => {
  const shipSelect = useShipSelect()
  const gearSelect = useGearSelect()
  return (
    <>
      <Dialog open={shipSelect.open} onClose={shipSelect.onClose}>
        <div>
          <ShipSelect />
        </div>
      </Dialog>
      <Dialog open={gearSelect.open} onClose={gearSelect.onClose}>
        <div>
          <GearSelect />
        </div>
      </Dialog>
    </>
  )
}

export default GlobalDialogs
