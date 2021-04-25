import styled from "@emotion/styled";
import NextImage from "next/image";
import React from "react";

type Props = Omit<React.ComponentProps<"img">, "src"> & {
  path: string;
  width: number;
  height: number;
};

const Image = React.forwardRef<HTMLImageElement, Props>(
  ({ path, ...rest }, ref) => {
    return <NextImage ref={ref} {...rest} src={`/${path}`} />;
  }
);

export default styled(Image)``;
