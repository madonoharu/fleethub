import React from "react"
import styled from "styled-components"

const StyledPicture = styled.picture`
  line-height: 0;
`

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

const Image = React.forwardRef<HTMLPictureElement, Props>(({ path, ...rest }, ref) => {
  const webp = requireImage(`webp/${path}.webp`)
  const png = requireImage(`png/${path}.png`)

  return (
    <StyledPicture ref={ref}>
      <source type="image/webp" srcSet={webp} />
      <img {...rest} src={png} />
    </StyledPicture>
  )
})

export default styled(Image)``
