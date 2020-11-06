import React from "react"
import styled from "styled-components"

const requireImage = (path: string): string | undefined => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return require(`../../../images/${path}`)
  } catch {
    console.warn(`${path} not found`)
    return
  }
}

type Props = Omit<React.ComponentProps<"img">, "src"> & {
  path: string
}

const Image = React.forwardRef<HTMLImageElement, Props>(({ path, ...rest }, ref) => {
  const png = requireImage(`${path}.png`)

  return <img ref={ref} {...rest} src={png} />
})

export default styled(Image)``
