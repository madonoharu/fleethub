import styled from "@emotion/styled";
import Image from "next/image";
import React from "react";

const KctoolsIconBase = React.forwardRef<
  HTMLImageElement,
  React.ComponentProps<"picture">
>((props, ref) => (
  <Image
    width={24}
    height={24}
    ref={ref}
    {...props}
    src={"/icons/kctools.png"}
  />
));

export default styled(KctoolsIconBase)`
  border-radius: 50%;
`;
