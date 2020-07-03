import React from "react"
import styled from "styled-components"

import { Image } from "../../atoms"

type Props = {
  shipId: number
  size?: "small" | "medium"
}

const ShipBanner: React.FCX<Props> = ({ className, shipId, size = "small" }) => {
  const scale = size === "small" ? 3 : 4
  return <Image className={className} height={scale * 8} width={scale * 32} path={`ships/${shipId}`} />
}

export default styled(ShipBanner)``
