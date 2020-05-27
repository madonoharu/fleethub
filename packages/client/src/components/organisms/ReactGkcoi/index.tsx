import React from "react"
import { generate, DeckBuilder } from "gkcoi"
import styled from "styled-components"

import { CircularProgress } from "@material-ui/core"
import { Alert } from "@material-ui/lab"

type GkcoiResult = { status: "loading" } | { status: "error" } | { status: "success"; canvas: HTMLCanvasElement }

const useGkcoi = (deck: DeckBuilder) => {
  const [result, setResult] = React.useState<GkcoiResult>({ status: "loading" })

  React.useEffect(() => {
    generate(deck)
      .then((canvas) => setResult({ status: "success", canvas }))
      .catch((reason) => {
        console.error(reason)
        setResult({ status: "error" })
      })

    return () => setResult({ status: "loading" })
  }, [deck])

  return result
}

const StyledCircularProgress = styled(CircularProgress)`
  display: block;
  margin: auto;
`

type Props = {
  deck: DeckBuilder
}

const ReactGkcoi: React.FCX<Props> = ({ className, deck }) => {
  const result = useGkcoi(deck)

  if (result.status === "loading") return <StyledCircularProgress size={80} />

  if (result.status === "error") {
    return (
      <Alert color="error" variant="outlined">
        Error
      </Alert>
    )
  }

  const { canvas } = result

  const handleClick = () => {
    window.open(canvas.toDataURL("png"), "_blank")
  }

  return (
    <canvas
      ref={(node) => {
        node?.getContext("2d")?.drawImage(canvas, 0, 0)
      }}
      onClick={handleClick}
      className={className}
      width={canvas.width}
      height={canvas.height}
    />
  )
}

const Styled = styled(ReactGkcoi)`
  width: 100%;
  cursor: pointer;
`

export default Styled
