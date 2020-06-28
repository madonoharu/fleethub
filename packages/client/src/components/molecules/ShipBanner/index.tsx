import React from "react"
import styled from "styled-components"

import { Image } from "../../atoms"

type Props = {
  shipId: number
}

const ShipBanner: React.FCX<Props> = ({ className, shipId }) => {
  return <Image className={className} height={24} width={96} src={`ships/1.webp`} />
}

export default styled(ShipBanner)``
