import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Fab, Tooltip } from "@mui/material";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { useModal } from "../../../hooks";

import CanvasModalContainer from "./CanvasModalContainer";
import { cn } from "../../../styles";

const CanvasContainer = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div {...props} className={cn("[&_canvas]:w-full [&_canvas]:[cursor:zoom-in]", className)} />
);

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
          className="absolute -top-8 -right-10"
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

export default ({ className, ...props }: React.ComponentProps<typeof CanvasViewer>) => (
  <CanvasViewer {...props} className={cn("relative", className)} />
);
