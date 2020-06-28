import React from "react"
import styled from "styled-components"

import { Image } from "../../atoms"

type Props = {
  icon: string
}

const StatIcon: React.FCX<Props> = ({ className, icon }) => {
  return <Image className={className} src={`stats/${icon}.webp`} />
}

export default styled(StatIcon)`
  height: 15px;
  filter: contrast(180%) opacity(0.9);
`
