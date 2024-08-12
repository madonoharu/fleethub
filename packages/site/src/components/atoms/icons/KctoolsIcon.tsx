import styled from "@emotion/styled";
import Image from "next/image";
import React from "react";

const KctoolsIcon: React.FCX = (props) => (
  <Image
    {...props}
    width={24}
    height={24}
    src={"/icons/kctools.png"}
    alt="kctools"
  />
);

export default styled(KctoolsIcon)`
  border-radius: 50%;
`;
