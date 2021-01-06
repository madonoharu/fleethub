import React from "react"
import styled from "@emotion/styled"

import { getCloudinaryUrl } from "../../../utils"

type Props = {
  publicId: string
  size?: "small" | "medium" | "large"
}

const values = {
  small: 3,
  medium: 4,
  large: 5,
}

const ShipBanner: React.FCX<Props> = ({ className, publicId, size = "small" }) => {
  const scale = values[size]

  const width = scale * 32
  const height = scale * 8

  const url = getCloudinaryUrl({ publicId, folder: "ships", width, height })

  return <img className={className} width={width} height={height} src={url} />
}

export default styled(ShipBanner)``
