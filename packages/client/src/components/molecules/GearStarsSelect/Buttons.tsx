import React from "react"
import styled from "styled-components"
import { range } from "@fleethub/utils"

import Button from "@material-ui/core/Button"

const starsToString = (stars: number) => {
  if (stars === 10) {
    return "★M"
  }
  return `★${stars}`
}

type Props = {
  onChange?: (stars: number) => void
}

const Component: React.FCX<Props> = ({ className, onChange }) => {
  const handleChange: React.MouseEventHandler<HTMLButtonElement> = React.useCallback(
    (event) => {
      onChange && onChange(Number(event.currentTarget.id))
    },
    [onChange]
  )

  return (
    <div className={className}>
      {range(11).map((stars) => (
        <Button key={stars} id={stars.toString()} size="small" onClick={handleChange}>
          {starsToString(stars)}
        </Button>
      ))}
    </div>
  )
}

const StyledComponent = styled(Component)`
  display: flex;
  flex-direction: column-reverse;

  > * {
    width: 80px;
    color: ${(props) => props.theme.colors.stars};
  }
`

export default StyledComponent
