import React from "react"
import styled from "styled-components"
import Image from "next/image"

type Props = {
  icon: string
}

const StatIcon: React.FCX<Props> = ({ className, icon }) => {
  return <Image className={className} width={15} height={15} src={`/stats/${icon}.png`} />
}

export default styled(StatIcon)`
  filter: contrast(180%) opacity(0.9);
`
