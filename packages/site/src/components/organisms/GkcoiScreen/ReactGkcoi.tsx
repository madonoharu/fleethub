import murmurhash from "@emotion/hash";
import styled from "@emotion/styled";
import { Alert, CircularProgress } from "@mui/material";
import stringify from "fast-json-stable-stringify";
import { DeckBuilder, generate } from "gkcoi";
import React, { useMemo } from "react";
import useSWRImmutable from "swr/immutable";

import CanvasViewer from "./CanvasViewer";

const StyledCircularProgress = styled(CircularProgress)`
  display: block;
  margin: auto;
`;

type Props = {
  deck: DeckBuilder;
};

const ReactGkcoi: React.FCX<Props> = ({ className, deck }) => {
  const hash = useMemo(() => murmurhash(stringify(deck)), [deck]);

  const { data, error } = useSWRImmutable(["gkcoi", hash], () =>
    generate(deck)
  );

  if (error) {
    return (
      <Alert color="error" variant="outlined">
        Error
      </Alert>
    );
  }

  if (!data) {
    return <StyledCircularProgress size={80} />;
  }

  return <CanvasViewer className={className} canvas={data} />;
};

export default ReactGkcoi;
