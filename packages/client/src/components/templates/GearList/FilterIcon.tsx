import React from "react"
import styled from "styled-components"
import { Image } from "../../atoms"

type Props = {
  icon: string
}

const FilterIcon: React.FCX<Props> = ({ className, icon }) => {
  return <Image className={className} height={18} width={48} src={`filters/${icon}.webp`} />
}

export default styled(FilterIcon)`
  filter: brightness(120%);
`
