import React from "react"
import { generate, DeckBuilder } from "gkcoi"
import styled from "styled-components"

import { CircularProgress } from "@material-ui/core"

const StyledCircularProgress = styled(CircularProgress)`
  display: block;
  margin: auto;
`

type Props = {
  deck: DeckBuilder
}

const ReactGkcoi: React.FCX<Props> = ({ className, deck }) => {
  const ref = React.useRef<HTMLCanvasElement | null>(null)
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => setLoaded(false), [deck])

  React.useEffect(() => {
    const node = ref.current
    if (!node || loaded) return

    const ctx = node.getContext("2d")
    ctx?.clearRect(0, 0, node.width, node.height)

    generate(deck).then((gkcoiCanvas) => {
      const { width, height } = gkcoiCanvas

      node.width = width
      node.height = height

      ctx?.drawImage(gkcoiCanvas, 0, 0)
      setLoaded(true)
    })
  }, [ref, loaded, deck])

  return (
    <div>
      {!loaded && <StyledCircularProgress size={80} />}
      <canvas ref={ref} className={className} />
    </div>
  )
}

const Styled = styled(ReactGkcoi)`
  width: 100%;
`

export default React.memo(Styled)
