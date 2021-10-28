/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { Alert, CircularProgress } from "@mui/material";
import { DeckBuilder, generate } from "gkcoi";
import React from "react";
import { useAsync } from "react-async-hook";

import CanvasViewer from "./CanvasViewer";

const StyledCircularProgress = styled(CircularProgress)`
  display: block;
  margin: auto;
`;

type Props = {
  deck: DeckBuilder;
};

const ReactGkcoi: React.FCX<Props> = ({ className, deck }) => {
  const asyncCanvas = useAsync(generate, [deck]);

  if (asyncCanvas.status === "not-requested") return null;
  if (asyncCanvas.status === "loading")
    return <StyledCircularProgress size={80} />;

  if (asyncCanvas.status === "error") {
    return (
      <Alert color="error" variant="outlined">
        Error
      </Alert>
    );
  }

  const canvas = asyncCanvas.result;
  if (!canvas) return null;

  return <CanvasViewer className={className} canvas={canvas} />;
};

export default ReactGkcoi;
