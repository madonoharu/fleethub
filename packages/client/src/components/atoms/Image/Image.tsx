import React from "react"

const Image = React.forwardRef<HTMLImageElement, React.ComponentProps<"img">>(({ src: path, ...rest }, ref) => {
  let src: string | undefined
  try {
    src = path && require("../../../images/" + path)
  } catch {
    console.warn(`${path} not found`)
  }

  return <img ref={ref} src={src} {...rest} />
})

export default Image
