import React from "react"
import styled from "styled-components"

import { useModal } from "../../../hooks"

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

  return (
    <>
      {React.cloneElement(element, { className, onClick: Modal.show })}
      <Modal maxWidth="xl">{element}</Modal>
    </>
  )
}

export default styled(CanvasViewer)`
  width: 100%;
  cursor: pointer;
`
