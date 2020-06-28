import React from "react"
import styled from "styled-components"

import { Image } from "../../atoms"

type Props = {
  iconId: number
}

const GearIcon: React.FCX<Props> = ({ className, iconId }) => {
  if (!iconId) return null
  return <Image className={className} width={24} height={24} src={`gears/${iconId}.webp`} />
}

export default styled(GearIcon)``
