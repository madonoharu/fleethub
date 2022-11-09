import styled from "@emotion/styled";
import Image from "next/image";
import React from "react";

interface Props {
  icon: string;
}

const StatIcon: React.FCX<Props> = ({ className, icon }) => {
  return (
    <Image
      className={className}
      width={15}
      height={15}
      src={`/stats/${icon}.png`}
      alt={icon}
    />
  );
};

export default styled(StatIcon)`
  filter: contrast(1.8);
`;
