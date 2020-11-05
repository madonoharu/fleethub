import React from "react"
import styled from "styled-components"

type Props = {
  publicId: string
  size?: "small" | "medium" | "large"
}

const values = {
  small: 3,
  medium: 4,
  large: 5,
}

type CloudinaryOptions = {
  publicId: string
  folder: string
  width: number
  height: number
}

const getCloudinaryUrl = ({ publicId, folder, width, height }: CloudinaryOptions) =>
  `https://res.cloudinary.com/djg1epjdj/image/upload/c_scale,f_auto,q_auto,w_${width},h_${height}/${folder}/${publicId}.png`

const ShipBanner: React.FCX<Props> = ({ className, publicId, size = "small" }) => {
  const scale = values[size]

  const width = scale * 32
  const height = scale * 8

  const url = getCloudinaryUrl({ publicId, folder: "ships", width, height })

  return <img className={className} width={width} height={height} src={url} />
}

export default styled(ShipBanner)``
