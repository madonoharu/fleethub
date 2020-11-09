import React from "react"
import { generate, DeckBuilder } from "gkcoi"
import styled from "@emotion/styled"
import { useAsync } from "react-async-hook"

import { CircularProgress } from "@material-ui/core"
import { Alert } from "@material-ui/lab"

import CanvasViewer from "./CanvasViewer"

const StyledCircularProgress = styled(CircularProgress)`
  display: block;
  margin: auto;
`

type Props = {
  deck: DeckBuilder
}

const ReactGkcoi: React.FCX<Props> = ({ className, deck }) => {
  const asyncCanvas = useAsync(generate, [deck])

  if (asyncCanvas.status === "not-requested") return null
  if (asyncCanvas.status === "loading") return <StyledCircularProgress size={80} />

  if (asyncCanvas.status === "error") {
    return (
      <Alert color="error" variant="outlined">
        Error
      </Alert>
    )
  }

  const canvas = asyncCanvas.result
  if (!canvas) return null

  return <CanvasViewer className={className} canvas={canvas} />
}

export default ReactGkcoi
