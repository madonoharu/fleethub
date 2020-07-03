import React from "react"
import styled from "styled-components"

const requireImage = (path: string) => {
  try {
    return require(`../../../images/${path}`)
  } catch {
    console.warn(`${path} not found`)
  }
}

type Props = React.ComponentProps<"picture"> & {
  path: string
  height: number
  width: number
}

const Image = React.forwardRef<HTMLPictureElement, Props>(({ path, height, width, ...rest }, ref) => {
  const webp = requireImage(path + ".webp")
  const png = requireImage(path + ".png")

  return (
    <picture ref={ref} {...rest}>
      <source type="image/webp" srcSet={webp} />
      <img src={png} height={height} width={width} />
    </picture>
  )
})

export default styled(Image)`
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
`
