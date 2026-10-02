import { cn } from "../../../styles/cn";
import Image from "next/image";
import React from "react";

import kctools from "../../../images/icons/kctools.png";

const KctoolsIcon: React.FCX = ({ className, ...props }) => (
  <Image
    {...props}
    className={cn("rounded-full", className)}
    width={24}
    height={24}
    src={kctools}
    alt="kctools"
    unoptimized
  />
);

export default KctoolsIcon;
