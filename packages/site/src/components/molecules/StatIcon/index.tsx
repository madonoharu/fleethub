import { cn } from "../../../styles/cn";
import Image from "next/image";
import React from "react";

import { STAT_ICONS, StatIconKey } from "../../../images/stats";

interface Props {
  icon: StatIconKey;
}

const StatIcon: React.FCX<Props> = ({ className, icon }) => {
  return (
    <Image
      className={cn("contrast-[1.8]", className)}
      width={15}
      height={15}
      src={STAT_ICONS[icon]}
      alt={icon}
      unoptimized
    />
  );
};

export default StatIcon;
