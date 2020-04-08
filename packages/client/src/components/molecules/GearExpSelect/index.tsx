import React from "react"
import styled from "styled-components"
import { Proficiency } from "@fleethub/core"

import Button from "@material-ui/core/Button"
import Tooltip from "@material-ui/core/Tooltip"
import Popover from "@material-ui/core/Popover"

import ProficiencyIcon from "./ProficiencyIcon"
import { Flexbox, NumberInput } from "../../../components"
import { usePopover } from "../../../hooks"

const { expTable, maxExp } = Proficiency
const exps = expTable.concat(maxExp)

const anchorOrigin = {
  vertical: "bottom",
  horizontal: "center",
} as const

type Props = {
  className?: string
  size?: "small"
  exp: number
  onChange?: (value: number) => void
}

const Component: React.FC<Props> = ({ className, size, exp, onChange }) => {
  const { onOpen, ...hendler } = usePopover()

  const handleChange: React.MouseEventHandler = React.useCallback(
    (event) => {
      onChange && onChange(Number(event.currentTarget.id))
      hendler.onClose()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChange, hendler.onClose]
  )

  return (
    <div className={className}>
      <Tooltip title="熟練度選択">
        <Button onClick={onOpen}>
          <ProficiencyIcon size={size} exp={exp} />
        </Button>
      </Tooltip>

      <Popover anchorOrigin={anchorOrigin} {...hendler}>
        <Flexbox>
          {exps.map((boundary) => (
            <Button key={boundary} id={boundary.toString()} onClick={handleChange}>
              <ProficiencyIcon size="small" exp={boundary} />
            </Button>
          ))}
          <NumberInput value={exp} onChange={onChange} min={0} max={maxExp} />
        </Flexbox>
      </Popover>
    </div>
  )
}

const StyledComponent = styled(Component)`
  button {
    padding: 0;
  }
  input {
    width: 64px;
    margin: 0 8px;
  }
`

export default StyledComponent
