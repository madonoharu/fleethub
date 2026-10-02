import Image from "next/image";
import React from "react";

import { cn } from "../../../styles/cn";
import { FILTER_ICONS, FilterIconKey } from "../../../images/filters";

type Props = {
  icon: FilterIconKey;
};

const FilterIcon: React.FCX<Props> = ({ className, icon }) => {
  return (
    <Image
      className={cn("brightness-120", className)}
      height={18}
      width={48}
      src={FILTER_ICONS[icon]}
      alt={icon}
      unoptimized
    />
  );
};

export default FilterIcon;
