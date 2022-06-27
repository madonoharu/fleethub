import styled from "@emotion/styled";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Fab, Tooltip } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { useModal } from "../../../hooks";

import CanvasModalContainer from "./CanvasModalContainer";

const CanvasContainer = styled.div`
  canvas {
    width: 100%;
    cursor: zoom-in;
  }
`;

type Props = {
  canvas: HTMLCanvasElement;
};

const CanvasViewer: React.FCX<Props> = ({ className, canvas }) => {
  const { t } = useTranslation("common");
  const Modal = useModal();

  const element = (
    <canvas
      ref={(node) => {
        node?.getContext("2d")?.drawImage(canvas, 0, 0);
      }}
      width={canvas.width}
      height={canvas.height}
    />
  );

  const dataUrl = canvas.toDataURL();

  return (
    <div className={className}>
      <Tooltip title={t("Download")}>
        <Fab
          css={{ position: "absolute", top: -32, right: -40 }}
          color="secondary"
          component="a"
          href={dataUrl}
          download="canvas.png"
        >
          <FileDownloadIcon />
        </Fab>
      </Tooltip>

      <CanvasContainer onClick={Modal.show}>{element}</CanvasContainer>
      <Modal maxWidth="xl">
        <CanvasModalContainer>{element}</CanvasModalContainer>
      </Modal>
    </div>
  );
};

export default styled(CanvasViewer)`
  position: relative;
`;
