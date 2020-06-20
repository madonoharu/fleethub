import React from "react"
import styled from "styled-components"

import { Button, Tooltip } from "@material-ui/core"

import { Flexbox, NumberInput } from "../../../components"
import { usePopover } from "../../../hooks"

import ProficiencyIcon from "./ProficiencyIcon"

const exps = [0, 10, 25, 40, 55, 70, 85, 100, 120]

const anchorOrigin = {
  vertical: "bottom",
  horizontal: "center",
} as const

type Props = {
  className?: string
  exp: number
  onChange?: (value: number) => void
}

const GearExpSelect: React.FC<Props> = ({ className, exp, onChange }) => {
  const Popover = usePopover()

  const handleChange: React.MouseEventHandler = (event) => {
    onChange && onChange(Number(event.currentTarget.id))
    Popover.hide()
  }

  return (
    <div className={className}>
      <Tooltip title="熟練度選択">
        <Button onClick={Popover.show}>
          <ProficiencyIcon exp={exp} />
        </Button>
      </Tooltip>

      <Popover anchorOrigin={anchorOrigin}>
        <Flexbox>
          {exps.map((boundary) => (
            <Button key={boundary} id={boundary.toString()} onClick={handleChange}>
              <ProficiencyIcon exp={boundary} />
            </Button>
          ))}
          <NumberInput value={exp} onChange={onChange} min={0} max={120} />
        </Flexbox>
      </Popover>
    </div>
  )
}

export default styled(GearExpSelect)`
  button {
    padding: 0;
  }
  input {
    width: 64px;
    margin: 0 8px;
  }
`
