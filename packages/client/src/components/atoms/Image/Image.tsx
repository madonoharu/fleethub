import React from "react"
import styled from "styled-components"

const StyledPicture = styled.picture`
  line-height: 1;
  font-size: 0;
`

const requireImage = (path: string) => {
  try {
    return require(`../../../images/${path}`)
  } catch {
    console.warn(`${path} not found`)
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
