import React from "react"
import styled from "styled-components"

import { Image } from "../../atoms"

type Props = {
  shipId: number
  size?: "small" | "medium" | "large"
}

const values = {
  small: 3,
  medium: 4,
  large: 5,
}

const ShipBanner: React.FCX<Props> = ({ className, shipId, size = "small" }) => {
  const scale = values[size]
  return <Image className={className} height={scale * 8} width={scale * 32} path={`ships/${shipId}`} />
}

export default styled(ShipBanner)``
