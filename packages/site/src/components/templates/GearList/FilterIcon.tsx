import styled from "@emotion/styled";
import Image from "next/image";
import React from "react";

type Props = {
  icon: string;
};

const FilterIcon: React.FCX<Props> = ({ className, icon }) => {
  return (
    <Image
      className={className}
      height={18}
      width={48}
      src={`/filters/${icon}.png`}
    />
  );
};

export default styled(FilterIcon)`
  filter: brightness(120%);
`;
