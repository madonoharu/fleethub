/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import React, { useState } from "react";

const Container = styled.div<{ $zoom: boolean }>`
  canvas {
    cursor: zoom-out;
  }

  ${(props) =>
    !props.$zoom &&
    css`
      canvas {
        width: 100%;
        cursor: zoom-in;
      }
    `}
`;

const CanvasModalContainer: React.FCX = ({ className, children }) => {
  const [zoom, setZoom] = useState(true);

  const handleToggle = () => setZoom((value) => !value);

  return (
    <Container className={className} $zoom={zoom} onClick={handleToggle}>
      {children}
    </Container>
  );
};

export default CanvasModalContainer;
