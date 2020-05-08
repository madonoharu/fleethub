import React from "react"
import { generate, DeckBuilder } from "gkcoi"

type Props = {
  deck: DeckBuilder
}

const ReactGkcoi: React.FC<Props> = ({ deck }) => {
  const ref = React.useRef<HTMLCanvasElement | null>(null)
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => setLoaded(false), [deck])

  React.useEffect(() => {
    const node = ref.current
    if (!node || loaded) return

    generate(deck).then((gkcoiCanvas) => {
      const { width, height } = gkcoiCanvas

      node.width = width
      node.height = height

      const ctx = node.getContext("2d")
      ctx?.drawImage(gkcoiCanvas, 0, 0)
      setLoaded(true)
    })
  }, [ref, loaded, deck])

  return <canvas ref={ref} />
}

export default React.memo(ReactGkcoi)
