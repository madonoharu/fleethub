import styled from "@emotion/styled";
import Image from "next/image";
import React from "react";

import { FILTER_ICONS, FilterIconKey } from "../../../images/filters";

type Props = {
  icon: FilterIconKey;
};

const FilterIcon: React.FCX<Props> = ({ className, icon }) => {
  return (
    <Image
      className={className}
      height={18}
      width={48}
      src={FILTER_ICONS[icon]}
      alt={icon}
      unoptimized
    />
  );
};

export default styled(FilterIcon)`
  filter: brightness(120%);
`;
