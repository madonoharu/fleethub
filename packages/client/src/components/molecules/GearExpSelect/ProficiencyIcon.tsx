import React from "react"
import styled from "styled-components"
import { ProficiencyExp } from "@fleethub/core"

import Image from "next/image"
import { Typography } from "@material-ui/core"

const Exp = styled(Typography)`
  position: absolute;
  font-size: 10px;
  bottom: 0;
  right: 0;
  line-height: 1;
  background: rgba(128, 64, 64, 0.6);
  border-radius: 2px;
`

type ProficiencyIconProps = Pick<React.ComponentProps<"div">, "className" | "onClick"> & {
  exp: number
}

const ProficiencyIcon = React.forwardRef<HTMLDivElement, ProficiencyIconProps>((props, ref) => {
  const { exp, ...divProps } = props
  const ace = ProficiencyExp.expToAce(exp)

  return (
    <div ref={ref} {...divProps}>
      <Image height={24} width={18} src={`/proficiency/${ace}.png`} />
      <Exp>{exp}</Exp>
    </div>
  )
})

export default styled(ProficiencyIcon)`
  height: 24px;
  filter: brightness(110%) contrast(110%) saturate(100%);
`
