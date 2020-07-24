import React from "react"
import styled from "styled-components"

import { IconButton, Tooltip, Fab } from "@material-ui/core"
import SaveIcon from "@material-ui/icons/Save"

import { useModal } from "../../../hooks"
import CanvasModalContainer from "./CanvasModalContainer"

const StyledFab: typeof Fab = styled(Fab)`
  position: absolute;
  right: -64px;
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
    <div className={className}>
      <Tooltip title="download">
        <StyledFab color="secondary" component="a" href={dataUrl} download="canvas.png">
          <SaveIcon />
        </StyledFab>
      </Tooltip>

      <CanvasContainer onClick={Modal.show}>{element}</CanvasContainer>
      <Modal maxWidth="xl">
        <CanvasModalContainer>{element}</CanvasModalContainer>
      </Modal>
    </div>
  )
}

export default styled(CanvasViewer)`
  position: relative;
`
