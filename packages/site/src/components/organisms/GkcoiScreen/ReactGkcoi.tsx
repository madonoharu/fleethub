import murmurhash from "@emotion/hash";
import { FLEET_KEYS, SHIP_KEYS } from "@fh/utils";

import { Alert, CircularProgress } from "@mui/material";
import stringify from "fast-json-stable-stringify";
import { DeckBuilder, generate } from "gkcoi";
import React, { useMemo } from "react";
import useSWRImmutable from "swr/immutable";

import { ErrorAlert } from "../../molecules";

import CanvasViewer from "./CanvasViewer";
import { cn } from "../../../styles";

const StyledCircularProgress = ({
  className,
  ...props
}: React.ComponentProps<typeof CircularProgress>) => (
  <CircularProgress {...props} className={cn("block m-auto", className)} />
);

type Props = {
  deck: DeckBuilder;
};

const ReactGkcoi: React.FCX<Props> = ({ className, deck }) => {
  const hash = useMemo(() => murmurhash(stringify(deck)), [deck]);
  const hasShips = FLEET_KEYS.some((fleet) =>
    SHIP_KEYS.some((ship) => Number(deck[fleet]?.[ship]?.id) > 0),
  );

  const { data, error } = useSWRImmutable<HTMLCanvasElement, unknown, [string, string] | null>(
    hasShips ? ["gkcoi", hash] : null,
    () => generate(deck),
  );

  if (!hasShips) {
    return (
      <Alert className={className} severity="info">
        画像を生成するには、艦隊に艦娘を追加してください。
      </Alert>
    );
  }

  if (error) {
    return <ErrorAlert title="画像生成に失敗しました" error={error} />;
  }

  if (!data) {
    return <StyledCircularProgress size={80} />;
  }

  return <CanvasViewer className={className} canvas={data} />;
};

export default ReactGkcoi;
