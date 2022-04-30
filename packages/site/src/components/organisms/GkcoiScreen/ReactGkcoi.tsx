import murmurhash from "@emotion/hash";
import styled from "@emotion/styled";
import { CircularProgress } from "@mui/material";
import stringify from "fast-json-stable-stringify";
import { DeckBuilder, generate } from "gkcoi";
import React, { useMemo } from "react";
import useSWRImmutable from "swr/immutable";

import { ErrorAlert } from "../../molecules";

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

  const { data, error } = useSWRImmutable<
    HTMLCanvasElement,
    unknown,
    [string, string]
  >(["gkcoi", hash], () => generate(deck));

  if (error) {
    return <ErrorAlert title="画像生成に失敗しました" error={error} />;
  }

  if (!data) {
    return <StyledCircularProgress size={80} />;
  }

  return <CanvasViewer className={className} canvas={data} />;
};

export default ReactGkcoi;
