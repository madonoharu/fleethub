import React from "react"
import styled from "styled-components"
import { ShipStat } from "@fleethub/core"
import { useTranslation } from "react-i18next"

import { Button, Tooltip, Dialog } from "@material-ui/core"

import { StatIcon } from "../../../components"
import { StatKeyDictionary } from "../../../utils"

import ShipStatText from "./ShipStatText"
import ShipStatForm, { ShipStatProps } from "./ShipStatForm"
import { useOpen } from "../../../hooks"

type Props = ShipStatProps

const ShipStatButton: React.FCX<Props> = ({ className, statKey, stat, onUpdate }) => {
  const { onOpen, ...handler } = useOpen()

  return (
    <>
      <Tooltip title={StatKeyDictionary[statKey]}>
        <Button className={className} onClick={onOpen}>
          <StatIcon icon={statKey} />
          <ShipStatText stat={stat} />
        </Button>
      </Tooltip>
      <Dialog {...handler}>
        <ShipStatForm statKey={statKey} stat={stat} onUpdate={onUpdate} />
      </Dialog>
    </>
  )
}

export default styled(ShipStatButton)`
  display: flex;
  align-items: center;

  font-size: 0.75rem;
  line-height: 1.5;
  font-weight: 400;

  ${StatIcon} {
    margin: 0 4px;
  }
`
