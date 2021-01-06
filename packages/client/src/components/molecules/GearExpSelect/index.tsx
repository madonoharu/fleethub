import React from "react"
import styled from "@emotion/styled"

import { Button, Tooltip } from "@material-ui/core"

import { usePopover } from "../../../hooks"

import ProficiencyIcon from "./ProficiencyIcon"
import NumberInput from "../NumberInput"

const ColumnReverse = styled.div`
  display: flex;
  flex-direction: column-reverse;
`

const StyledNumberInput = styled(NumberInput)`
  width: 96px;
  margin: 0 4px;
`

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
        <ColumnReverse>
          {exps.map((boundary) => (
            <Button key={boundary} id={boundary.toString()} onClick={handleChange}>
              <ProficiencyIcon exp={boundary} />
            </Button>
          ))}
        </ColumnReverse>

        <StyledNumberInput label="内部熟練度" variant="outlined" value={exp} onChange={onChange} min={0} max={120} />
      </Popover>
    </div>
  )
}

export default styled(GearExpSelect)`
  button {
    padding: 0 3px;
  }
  input {
    width: 64px;
    margin: 0 8px;
  }
`
