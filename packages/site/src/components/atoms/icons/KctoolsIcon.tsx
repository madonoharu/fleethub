import styled from "@emotion/styled";
import Image from "next/image";
import React from "react";

const KctoolsIcon: React.FCX = (props) => (
  <Image
    {...props}
    layout="fixed"
    width={24}
    height={24}
    src={"/icons/kctools.png"}
  />
);

export default styled(KctoolsIcon)`
  border-radius: 50%;
`;
