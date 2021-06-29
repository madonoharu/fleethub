import styled from "@emotion/styled";
import NextImage, { ImageProps } from "next/image";
import React from "react";

type Props = Omit<ImageProps, "src"> & {
  path: string;
  width: number;
  height: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NextImageAsAny = NextImage as any;

const Image = React.forwardRef<HTMLImageElement, Props>(
  ({ path, ...rest }, ref) => {
    return <NextImageAsAny ref={ref} {...rest} src={`/${path}`} />;
  }
);

export default styled(Image)``;
