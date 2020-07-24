import React from "react"
import styled from "styled-components"

import { IconButton, Tooltip } from "@material-ui/core"
import SaveIcon from "@material-ui/icons/Save"

import { useModal } from "../../../hooks"

const CanvasAction = styled.div`
  text-align: right;
`

const CanvasContainer = styled.div`
  canvas {
    width: 100%;
    cursor: zoom-in;
  }
`

type Props = {
  canvas: HTMLCanvasElement
}

const CanvasViewer: React.FCX<Props> = ({ className, canvas }) => {
  const Modal = useModal()

  const element = (
    <canvas
      ref={(node) => {
        node?.getContext("2d")?.drawImage(canvas, 0, 0)
      }}
      width={canvas.width}
      height={canvas.height}
    />
  )

  const dataUrl = canvas.toDataURL()

  return (
    <div>
      <CanvasAction>
        <Tooltip title="download">
          <IconButton component="a" href={dataUrl} download="canvas.png">
            <SaveIcon />
          </IconButton>
        </Tooltip>
      </CanvasAction>

      <CanvasContainer onClick={Modal.show}>{element}</CanvasContainer>
      <Modal maxWidth="xl">{element}</Modal>
    </div>
  )
}

export default CanvasViewer
