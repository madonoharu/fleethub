import React from "react"
import { css } from "@emotion/react"
import styled from "@emotion/styled"
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

const StyledComponent = styled(Component)(
  ({ theme }) => css`
    display: flex;
    flex-direction: column-reverse;

    > * {
      width: 80px;
      color: ${theme.colors.stars};
    }
  `
)

export default StyledComponent
