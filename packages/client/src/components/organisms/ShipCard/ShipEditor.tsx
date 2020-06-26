import React from "react"
import styled from "styled-components"
import { Ship, ShipState } from "@fleethub/core"

import { Button, Typography } from "@material-ui/core"

import { NumberInput, NumberInputProps, Flexbox } from "../../../components"
import { Update } from "../../../utils"

const StyledInput = styled((props: NumberInputProps) => <NumberInput variant="outlined" size="small" {...props} />)``

const LineContainer = styled(Flexbox)`
  margin-top: 8px;
`

type Props = {
  ship: Ship
  update: Update<ShipState>
}

const ShipEditor: React.FCX<Props> = ({ className, ship, update }) => {
  const change = (changes: Partial<ShipState>) => {
    update((draft) => {
      Object.assign(draft, changes)
    })
  }

  return (
    <div className={className}>
      <Flexbox>
        <Typography variant="h6">{ship.name}</Typography>
      </Flexbox>

      <LineContainer>
        <StyledInput label="Lv" value={ship.level} onChange={(level) => change({ level })} min={1} max={175} />
        <Button onClick={() => change({ level: 99 })}>Lv99</Button>
        <Button onClick={() => change({ level: 175 })}>Lv175</Button>
      </LineContainer>

      <LineContainer>
        <StyledInput
          label="耐久改修"
          value={ship.maxHp.increase}
          onChange={(maxHp) => change({ maxHp })}
          min={0}
          max={2}
        />
      </LineContainer>
      <LineContainer>
        <StyledInput label="運改修" value={ship.luck.increase} onChange={(luck) => change({ luck })} min={0} />
      </LineContainer>
      <LineContainer>
        <StyledInput label="対潜改修" value={ship.asw.increase} onChange={(asw) => change({ asw })} min={0} max={9} />
        <Button onClick={() => change({ asw: 0 })}>0</Button>
        <Button onClick={() => change({ asw: 9 })}>9</Button>
      </LineContainer>
    </div>
  )
}

export default styled(ShipEditor)`
  ${NumberInput} .MuiTextField-root {
  }
`
