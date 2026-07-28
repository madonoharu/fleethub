import styled from "@emotion/styled";
import Image from "next/image";
import React from "react";

import kctools from "../../../images/icons/kctools.png";

const KctoolsIcon: React.FCX = (props) => (
  <Image
    {...props}
    width={24}
    height={24}
    src={kctools}
    alt="kctools"
    unoptimized
  />
);

export default styled(KctoolsIcon)`
  border-radius: 50%;
`;
